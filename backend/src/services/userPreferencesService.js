class UserPreferencesService {
  constructor(prisma, logger) {
    this.prisma = prisma
    this.logger = logger
  }

  // Default preferences structure
  getDefaultPreferences() {
    return {
      default_view: "grid",
      items_per_page: 20,
      show_spoilers: false,
      auto_update_status: true,
      email_updates: false,
      release_notifications: false,
      menu_options: ["games", "movies", "tv", "books"]
    }
  }

  // Get user preferences with defaults
  async getUserPreferences(userId) {
    try {
      const userPreferences = await this.prisma.userPreferences.findUnique({
        where: { userId }
      })

      if (!userPreferences) {
        // Return default preferences if none exist
        return this.getDefaultPreferences()
      }

      // Merge with defaults to ensure all fields exist
      return {
        ...this.getDefaultPreferences(),
        ...userPreferences.preferences
      }
    } catch (error) {
      this.logger.error('Error getting user preferences:', error)
      throw error
    }
  }

  // Update user preferences
  async updateUserPreferences(userId, preferences) {
    try {
      // Get current preferences to merge
      const currentPreferences = await this.getUserPreferences(userId)
      
      // Merge new preferences with current ones
      const updatedPreferences = {
        ...currentPreferences,
        ...preferences
      }

      // Upsert preferences record
      const result = await this.prisma.userPreferences.upsert({
        where: { userId },
        update: {
          preferences: updatedPreferences,
          updatedAt: new Date()
        },
        create: {
          userId,
          preferences: updatedPreferences
        }
      })

      return updatedPreferences
    } catch (error) {
      this.logger.error('Error updating user preferences:', error)
      throw error
    }
  }

  // Reset preferences to defaults
  async resetUserPreferences(userId) {
    try {
      const defaultPreferences = this.getDefaultPreferences()
      
      await this.prisma.userPreferences.upsert({
        where: { userId },
        update: {
          preferences: defaultPreferences,
          updatedAt: new Date()
        },
        create: {
          userId,
          preferences: defaultPreferences
        }
      })

      return defaultPreferences
    } catch (error) {
      this.logger.error('Error resetting user preferences:', error)
      throw error
    }
  }

  // Delete user preferences (cleanup)
  async deleteUserPreferences(userId) {
    try {
      await this.prisma.userPreferences.delete({
        where: { userId }
      })
    } catch (error) {
      // Ignore if preferences don't exist
      if (error.code !== 'P2025') {
        this.logger.error('Error deleting user preferences:', error)
        throw error
      }
    }
  }
}

export default UserPreferencesService
