import bcrypt from 'bcryptjs'

class AuthService {
  constructor(prisma, jwt, logger) {
    this.prisma = prisma
    this.jwt = jwt
    this.logger = logger
  }

  /**
   * Validates registration input
   */
  validateRegistration(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }
  }

  /**
   * Validates login input
   */
  validateLogin(email, password) {
    if (!email || !password) {
      throw new Error('Email and password are required')
    }
  }

  /**
   * Checks if user already exists
   */
  async checkUserExists(email) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      throw new Error('User already exists')
    }
  }

  /**
   * Hashes password
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, 12)
  }

  /**
   * Generates JWT tokens
   */
  generateTokens(userId) {
    const token = this.jwt.sign({ userId })
    return { token }
  }

  /**
   * Transforms user response for registration/login
   */
  transformAuthResponse(user) {
    return {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      created_at: user.createdAt.toISOString()
    }
  }

  /**
   * Registers a new user
   */
  async registerUser(email, password) {
    try {
      this.validateRegistration(email, password)
      await this.checkUserExists(email)

      const hashedPassword = await this.hashPassword(password)

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true
        }
      })

      const tokens = this.generateTokens(user.id)

      return {
        user: this.transformAuthResponse(user),
        ...tokens
      }
    } catch (error) {
      this.logger.error('AuthService.registerUser error:', error)
      throw error
    }
  }

  /**
   * Finds user by email for login
   */
  async findUserForLogin(email) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    })

    if (!user) {
      throw new Error('Invalid email or password')
    }

    return user
  }

  /**
   * Verifies password
   */
  async verifyPassword(password, hashedPassword) {
    const isValid = await bcrypt.compare(password, hashedPassword)
    if (!isValid) {
      throw new Error('Invalid email or password')
    }
  }

  /**
   * Authenticates user login
   */
  async loginUser(email, password) {
    try {
      this.validateLogin(email, password)

      const user = await this.findUserForLogin(email)
      await this.verifyPassword(password, user.password)

      const tokens = this.generateTokens(user.id)

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user

      return {
        user: this.transformAuthResponse(userWithoutPassword),
        ...tokens
      }
    } catch (error) {
      this.logger.error('AuthService.loginUser error:', error)
      throw error
    }
  }

  /**
   * Gets authenticated user profile
   */
  async getAuthenticatedUser(userId) {
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

      return this.transformAuthResponse(user)
    } catch (error) {
      this.logger.error('AuthService.getAuthenticatedUser error:', error)
      throw error
    }
  }

  async getAuthenticatedUser(userId) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          createdAt: true,
          updatedAt: true
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      return user
    } catch (error) {
      this.log.error('Error getting authenticated user:', error)
      throw error
    }
  }
}

export default AuthService
