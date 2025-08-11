import { useMediaStore } from "@/stores/media";

export function useMediaTypes() {
  const mediaStore = useMediaStore();

  // Get media type configuration
  const getMediaConfig = (mediaType) => {
    return mediaStore.getMediaTypeConfig(mediaType);
  };

  // Generate stats cards for any media type
  const generateStatsCards = (stats, mediaType) => {
    const config = getMediaConfig(mediaType);
    if (!config) return [];

    const statusDistribution = stats.statusDistribution || {};
    const totalItems = stats.totalItems || 0;
    const recentActivity = stats.recentActivity || [];

    // Helper function to calculate recent activity count
    const getRecentActivityCount = (days = 7) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      return recentActivity.filter((activity) => {
        const activityDate = new Date(activity.updatedAt || activity.createdAt);
        return activityDate >= cutoffDate;
      }).length;
    };

    // Helper function to format change text
    const formatChangeText = (count, period = "week") => {
      if (count === 0) return "No recent activity";
      if (count === 1) return `+1 this ${period}`;
      return `+${count} this ${period}`;
    };

    // Calculate active items (everything except completed and dropped)
    const activeCount =
      Object.values(statusDistribution).reduce(
        (sum, val) => sum + (val || 0),
        0
      ) -
      (statusDistribution.completed || 0) -
      (statusDistribution.dropped || 0);

    // Calculate completion percentage
    const completedCount = statusDistribution.COMPLETED || 0;
    const completionPercentage =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    return [
      {
        icon: "collection",
        label: `Total ${config.name}`,
        value: totalItems,
        change: formatChangeText(getRecentActivityCount()),
        color: "blue",
      },
      {
        icon: "play",
        label:
          config.statuses.find((s) => s.color === "green")?.label || "Active",
        value: activeCount,
        change: activeCount === 1 ? "1 active" : `${activeCount} active`,
        color: "green",
      },
      {
        icon: "check",
        label:
          config.statuses.find((s) => s.color === "purple")?.label ||
          "Completed",
        value: completedCount,
        change:
          totalItems > 0
            ? `${completionPercentage}% of library`
            : "0% of library",
        color: "purple",
      },
      {
        icon: "bookmark",
        label:
          config.statuses.find((s) => s.color === "yellow")?.label ||
          "Want to Try",
        value: statusDistribution.BACKLOG || 0,
        change: "In backlog",
        color: "yellow",
      },
    ];
  };

  // Transform activity items to be media-agnostic
  const transformActivityItem = (activity, mediaType) => {
    return {
      id: activity.id,
      type: `${mediaType}_added`,
      title: activity.title,
      subtitle: `${activity.status.replace("_", " ")} • ${formatRelativeTime(activity.updatedAt)}`,
      time: formatRelativeTime(activity.updatedAt),
      coverUrl: activity.coverUrl,
      mediaType,
    };
  };

  // Generate chart labels for different media types
  const getStatusChartLabels = (mediaType) => {
    const config = getMediaConfig(mediaType);
    return config ? config.statuses.map((status) => status.label) : [];
  };

  // Get chart colors for different media types
  const getStatusChartColors = (mediaType) => {
    const colorMap = {
      blue: "#3B82F6",
      green: "#10B981",
      purple: "#8B5CF6",
      yellow: "#F59E0B",
      red: "#EF4444",
    };

    const config = getMediaConfig(mediaType);
    return config
      ? config.statuses.map((status) => colorMap[status.color])
      : [];
  };

  // Format relative time (helper function)
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
    } else if (diffHours > 0) {
      return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
    } else if (diffMinutes > 0) {
      return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
    } else {
      return "Just now";
    }
  };

  return {
    getMediaConfig,
    generateStatsCards,
    transformActivityItem,
    getStatusChartLabels,
    getStatusChartColors,
    formatRelativeTime,
  };
}
