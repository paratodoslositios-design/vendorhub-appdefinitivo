// Notification utilities
import { prisma } from "./db";

export async function createNotification(
  userId: string,
  type: "info" | "warning" | "error" | "success",
  title: string,
  message: string,
  link?: string
) {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

export async function createStockAlert(
  productId: string,
  productName: string,
  currentStock: number,
  minStock: number
) {
  // Get all admin and vendor users
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["admin", "vendor"] },
      status: "active",
    },
  });

  // Create notification for each user
  const notifications = users.map((user) =>
    createNotification(
      user.id,
      "warning",
      "Stock bajo",
      `El producto "${productName}" tiene stock bajo (${currentStock}/${minStock})`,
      `/products?search=${productName}`
    )
  );

  await Promise.all(notifications);
}

export async function getUserNotifications(userId: string, unreadOnly = false) {
  return await prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly ? { read: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markNotificationAsRead(
  notificationId: string,
  userId: string
) {
  return await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: { read: true },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: { read: true },
  });
}
