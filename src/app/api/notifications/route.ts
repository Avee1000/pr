import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCache, setCache, CacheKeys, TTL_SECONDS } from '@/lib/redis/cache';

interface Notification {
  id: string;
  message: string;
  link: string;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cacheKey = CacheKeys.notifications(user.id);

  const cached = await getCache<Notification[]>(cacheKey);
  if (cached !== null) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'no-store' }
    });
  }

  const notifications: Notification[] = [];

  // Parallel database execution using lightweight HEAD requests
  const [
    { data: orders, error: overdueError },
    { count: customerCount, error: customerError },
    { count: orderCount, error: orderError }
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("price, payment_status, due_date, paid_at")
      .eq("user_id", user.id),

    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),

    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
  ]);

  // Log failures for monitoring
  if (overdueError) console.error('Error checking overdue orders:', overdueError);
  if (customerError) console.error('Error checking customer count:', customerError);
  if (orderError) console.error('Error checking order count:', orderError);

  // Calculate overdue count without early returning
  let overdueCount = 0;
  if (orders && orders.length > 0) {
    const current = new Date();

    for (const order of orders) {
      const dueDate = order.due_date ? new Date(order.due_date) : null;
      const isPastDue = dueDate !== null && dueDate.getTime() < current.getTime();

      if (order.payment_status === "overdue" || isPastDue) {
        overdueCount += 1;
      }
    }
  }

  if (overdueCount > 0) {
    notifications.push({
      id: 'overdue-payments',
      message: `You have ${overdueCount} overdue payment(s).`,
      link: '/dashboard/orders'
    });
  }

  if (!customerError && customerCount === 0) {
    notifications.push({
      id: 'no-customers',
      message: 'You have no customers. Add one to get started.',
      link: '/dashboard/customers'
    });
  }

  if (!orderError && orderCount === 0) {
    notifications.push({
      id: 'no-orders',
      message: 'You have no orders. Create one to get started.',
      link: '/dashboard/orders/create'
    });
  }

  const response = NextResponse.json(notifications, {
    headers: { 'Cache-Control': 'no-store' }
  });

  await setCache(cacheKey, notifications, TTL_SECONDS.SHORT);
  return response;
}