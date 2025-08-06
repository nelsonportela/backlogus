import bcrypt from 'bcrypt'

class UserService {
  constructor(prisma, logger) {
    this.prisma = prisma
    this.logger = logger
  }

  /**
   * Transforms user data for API response (snake_case formatting)
   */
  transformUserResponse(user) {
    return {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      avatar_url: user.avatarUrl,
      timezone: user.timezone,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString()
    }
  }

  /**
   * Gets user profile by ID
   */
  async getUserProfile(userId) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          timezone: true,
          createdAt: true,
          updatedAt: true
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      return this.transformUserResponse(user)
    } catch (error) {
      this.logger.error('UserService.getUserProfile error:', error)
      throw error
    }
  }

  /**
   * Validates user profile update data
   */
  async validateProfileUpdate(userId, currentEmail, updateData) {
    const { email, first_name, last_name, avatar_url, timezone } = updateData
    const validatedData = {}

    if (email !== undefined) {
      // Check if email is already taken by another user
      if (email !== currentEmail) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email }
        })
        
        if (existingUser) {
          throw new Error('Email already in use')
        }
      }
      validatedData.email = email
    }

    if (first_name !== undefined) validatedData.firstName = first_name
    if (last_name !== undefined) validatedData.lastName = last_name
    if (avatar_url !== undefined) validatedData.avatarUrl = avatar_url
    if (timezone !== undefined) validatedData.timezone = timezone

    if (Object.keys(validatedData).length === 0) {
      throw new Error('No valid fields to update')
    }

    return validatedData
  }

  /**
   * Updates user profile
   */
  async updateUserProfile(userId, currentEmail, updateData) {
    try {
      const validatedData = await this.validateProfileUpdate(userId, currentEmail, updateData)

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: validatedData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          timezone: true,
          updatedAt: true
        }
      })

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        first_name: updatedUser.firstName,
        last_name: updatedUser.lastName,
        avatar_url: updatedUser.avatarUrl,
        timezone: updatedUser.timezone,
        updated_at: updatedUser.updatedAt.toISOString()
      }
    } catch (error) {
      this.logger.error('UserService.updateUserProfile error:', error)
      throw error
    }
  }

  /**
   * Validates password change request
   */
  validatePasswordChange(currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
      throw new Error('Current password and new password are required')
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long')
    }
  }

  /**
   * Changes user password
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      this.validatePasswordChange(currentPassword, newPassword)

      // Get current user with password
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { password: true }
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password)
      if (!isValidPassword) {
        throw new Error('Current password is incorrect')
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10)

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      })

      return { message: 'Password updated successfully' }
    } catch (error) {
      this.logger.error('UserService.changePassword error:', error)
      throw error
    }
  }

  /**
   * Transforms API credentials for response
   */
  transformCredentialsResponse(credentials) {
    return credentials.map(cred => ({
      id: cred.id,
      api_provider: cred.apiProvider,
      is_active: cred.isActive,
      is_configured: true, // If it exists, it's configured
      created_at: cred.createdAt.toISOString(),
      updated_at: cred.updatedAt.toISOString()
    }))
  }

  /**
   * Gets user's API credentials
   */
  async getApiCredentials(userId) {
    try {
      const credentials = await this.prisma.userApiCredential.findMany({
        where: { userId },
        select: {
          id: true,
          apiProvider: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          // Don't send the actual credentials for security
        }
      })

      return this.transformCredentialsResponse(credentials)
    } catch (error) {
      this.logger.error('UserService.getApiCredentials error:', error)
      throw error
    }
  }

  /**
   * Validates API credentials based on provider
   */
  validateApiCredentials(provider, credentialData) {
    const supportedProviders = ['igdb', 'tmdb']
    
    if (!supportedProviders.includes(provider)) {
      throw new Error(`Unsupported API provider. Supported: ${supportedProviders.join(', ')}`)
    }

    const { api_key, client_id, access_token } = credentialData

    // Validate required fields based on provider
    if (provider === 'igdb' && (!client_id || !access_token)) {
      throw new Error('IGDB requires client_id and access_token')
    }

    if (provider === 'tmdb' && !api_key) {
      throw new Error('TMDB requires api_key')
    }
  }

  /**
   * Creates or updates API credentials
   */
  async upsertApiCredentials(userId, provider, credentialData) {
    try {
      this.validateApiCredentials(provider, credentialData)

      const { 
        api_key, 
        client_id, 
        client_secret, 
        access_token, 
        refresh_token,
        expires_at,
        is_active = true 
      } = credentialData

      const credentialRecord = {
        userId,
        apiProvider: provider,
        apiKey: api_key || null,
        clientId: client_id || null,
        clientSecret: client_secret || null,
        accessToken: access_token || null,
        refreshToken: refresh_token || null,
        expiresAt: expires_at ? new Date(expires_at) : null,
        isActive: is_active
      }

      const credential = await this.prisma.userApiCredential.upsert({
        where: {
          userId_apiProvider: {
            userId,
            apiProvider: provider
          }
        },
        update: {
          ...credentialRecord,
          updatedAt: new Date()
        },
        create: credentialRecord
      })

      return {
        id: credential.id,
        api_provider: credential.apiProvider,
        is_active: credential.isActive,
        is_configured: true,
        created_at: credential.createdAt.toISOString(),
        updated_at: credential.updatedAt.toISOString()
      }
    } catch (error) {
      this.logger.error('UserService.upsertApiCredentials error:', error)
      throw error
    }
  }

  /**
   * Deletes API credentials
   */
  async deleteApiCredentials(userId, provider) {
    try {
      const deletedCredential = await this.prisma.userApiCredential.deleteMany({
        where: {
          userId,
          apiProvider: provider
        }
      })

      if (deletedCredential.count === 0) {
        throw new Error('API credentials not found')
      }

      return { 
        message: `${provider.toUpperCase()} credentials removed successfully` 
      }
    } catch (error) {
      this.logger.error('UserService.deleteApiCredentials error:', error)
      throw error
    }
  }
}

export default UserService
