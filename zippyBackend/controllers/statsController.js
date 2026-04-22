import { db } from "../db.js";
import { userTable, horseTable, stableTable, sessionTable, inventoryTable, trainerTable } from "../schema.js";
import { count, sum, eq, sql } from "drizzle-orm";

export const getGlobalStats = async (req, res) => {
  try {
    // 1. Total Riders
    const ridersResult = await db
      .select({ count: count() })
      .from(userTable)
      .where(eq(userTable.type, "rider"));


    const totalRiders = ridersResult[0].count;

    // 2. Active Horses
    const horsesResult = await db
      .select()
      .from(horseTable);

    const totalHorses = horsesResult.length;

    // 3. Total Revenue (from Stables summary)
    const revenueResult = await db
      .select({ total: sum(stableTable.totalRevenue) })
      .from(stableTable);
    const totalRevenue = revenueResult[0].total || 0;

    // 4. Center Utilization (Simple mock logic based on total sessions vs total seats)
    const sessionsResult = await db
      .select({
        participants: sessionTable.participants,
        totalSeats: sessionTable.totalSeats
      })
      .from(sessionTable);

    let totalTaken = 0;
    let totalAvailable = 0;

    sessionsResult.forEach(s => {
      totalTaken += (s.participants?.length || 0);
      totalAvailable += (s.totalSeats || 0);
    });

    const utilization = totalAvailable > 0 ? Math.round((totalTaken / totalAvailable) * 100) : 0;

    // 5. Centers Data (Functionalizing the Center Performance Table)
    const stables = await db.select().from(stableTable);
    const trainerCounts = await db
      .select({ stableId: trainerTable.stableId, count: count() })
      .from(trainerTable)
      .groupBy(trainerTable.stableId);

    const users = await db.select().from(userTable).where(eq(userTable.type, "stableStaff"));

    const centers = stables.map(s => {
      // Find trainer count for this stable
      const trainerCount = Number(trainerCounts.find(tc => tc.stableId === s.id)?.count || 0);

      // Logic for status based on revenue/load
      let status = "STABLE";
      if (s.totalRevenue > 40000) status = "PEEK PERFORMANCE";
      else if (s.totalRevenue > 30000) status = "NEAR CAPACITY";
      else if (s.totalRevenue < 20000) status = "UNDER REVIEW";

      const horseCount = horsesResult.filter((horse) => horse.stableId === s.id).length;

      return {
        id: s.id,
        name: s.name,
        location: s.location,
        manager: users.find((user) => user.id === s.userId)?.name || "Not Assigned",
        activeRiders: Math.floor(totalRiders / (stables.length || 1)),
        monthlyRevenue: s.totalRevenue || 0,
        horseCount: horseCount,
        trainerCount: trainerCount,
        status: status,
        stocksCount: s.stocks.length || 0
      };
    });

    // 6. Recent Activity (Latest 5 Notifications in the system)
    const allUsers = await db.select({ notifications: userTable.notifications, name: userTable.name }).from(userTable);
    let recentActivity = [];
    allUsers.forEach(u => {
      const notifs = u.notifications || [];
      notifs.forEach(n => {
        recentActivity.push({
          title: n.title,
          desc: `${n.desc} (${u.name})`,
          time: n.time || "Recently",
          type: n.type
        });
      });
    });
    // Sort by "Recently" logic or just take last 5
    recentActivity = recentActivity.slice(-5).reverse();

    res.status(200).json({
      success: true,
      stats: {
        totalRiders: Number(totalRiders),
        totalHorses: Number(totalHorses),
        totalRevenue: Number(totalRevenue),
        utilization,
        revenueGrowth: "+12.5%",
        riderGrowth: "+5.2%",
        horseGrowth: "+2.1%",
        utilizationTrend: "-1.5%",
        centers,
        staff: users,
        recentActivity
      }
    });
  } catch (error) {
    console.error("Error fetching global stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getStableStats = async (req, res) => {
  const { stableId } = req.params;
  try {
    // 1. Inventory stocks (Always fetch regardless of stable found)
    console.log("DIAGNOSTIC: Fetching inventory...");
    const inventoryItems = await db.select().from(inventoryTable);
    console.log(`DIAGNOSTIC: Found ${inventoryItems.length} items in DB.`);

    // Log details of the first item to check key mapping
    if (inventoryItems.length > 0) {
      console.log("DIAGNOSTIC: Item 0 keys:", Object.keys(inventoryItems[0]));
      console.log("DIAGNOSTIC: Item 0 currentStock value:", inventoryItems[0].currentStock);
    }

    let mappedStocks = inventoryItems.map(item => ({
      ...item,
      stock: item.currentStock || 0,
      currentStock: item.currentStock || 0
    }));

    // Emergency Fallback: If DB is empty but we need to prove connection
    if (mappedStocks.length === 0) {
      console.log("DIAGNOSTIC: Adding internal TEST ITEM because DB was empty.");
      mappedStocks.push({
        id: 'test-id-123',
        name: 'API_CONNECTION_ACTIVE_TEST',
        category: 'Feed',
        stock: 99,
        currentStock: 99,
        unit: 'Tests',
        status: 'In Stock'
      });
    }

    // 2. Stable Check
    const stable = await db
      .select()
      .from(stableTable)
      .where(eq(stableTable.id, stableId));

    if (!stable.length) {
      console.warn(`STATEDATA_FETCH: Stable ${stableId} not found. Returning global inventory fallback.`);
      return res.status(200).json({
        success: true,
        stable: {
          id: stableId,
          name: "Global Overview",
          location: "All Centers",
          statusCounts: { total: 0, fit: 0, nearLimit: 0, restRequired: 0 },
          stocks: mappedStocks,
          _debug: { itemCount: inventoryItems.length, mode: 'fallback', timestamp: new Date().toISOString() }
        }
      });
    }

    const s = stable[0];

    // Horse status counts for this stable
    const horses = await db
      .select()
      .from(horseTable)
      .where(eq(horseTable.location, s.name));

    const sessions = await db.select().from(sessionTable);
    const todayStr = new Date().toISOString().split('T')[0];

    const nearLimitCount = horses.filter(h => {
      const todaySessions = sessions.filter(s => s.horseId === h.id && s.date === todayStr).length;
      return todaySessions >= 3;
    }).length;

    const restRequiredCount = horses.filter(h =>
      h.status === 'Medical' || h.status === 'Resting' || h.diet === 'Sick'
    ).length;

    const statusCounts = {
      total: horses.length,
      fit: horses.filter(h => h.status === 'Available' && h.diet !== 'Sick').length,
      nearLimit: nearLimitCount,
      restRequired: restRequiredCount
    };

    // Destructure to remove the conflicting 'stocks' property from the DB record if it exists
    const { stocks: dbStocks, ...stableInfo } = s;

    res.status(200).json({
      success: true,
      stable: {
        ...stableInfo,
        statusCounts,
        stocks: mappedStocks,
        _debug: { itemCount: inventoryItems.length, timestamp: new Date().toISOString() }
      }
    });
  } catch (error) {
    console.error("Error fetching stable stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRevenueStats = async (req, res) => {
  const { range } = req.query; // 'today', 'week', 'month'
  try {
    const sessions = await db.select().from(sessionTable);
    const stables = await db.select().from(stableTable);

    // Date filtering logic
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let filteredSessions = sessions;

    if (range === 'today') {
      filteredSessions = sessions.filter(s => s.date === todayStr);
    } else if (range === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      filteredSessions = sessions.filter(s => new Date(s.date) >= oneWeekAgo);
    } else if (range === 'month') {
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      filteredSessions = sessions.filter(s => {
        const d = new Date(s.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      });
    }

    // 1. Calculate Guest Revenue from filtered sessions
    let guestRevenue = 0;
    filteredSessions.forEach(s => {
      guestRevenue += (s.participants?.length || 0) * (Number(s.joiningAmount) || 0);
    });

    // 2. Global Stables Revenue (Scale based on range if today/week)
    let totalRevenue = stables.reduce((acc, s) => acc + (Number(s.totalRevenue) || 0), 0);

    if (range === 'today') {
      totalRevenue = guestRevenue * 1.5; // Heuristic for daily total
    } else if (range === 'week') {
      totalRevenue = totalRevenue / 4; // Approx weekly
    }

    // 3. Derived Metrics
    const enrollmentRevenue = Math.round((totalRevenue - guestRevenue) * 0.55);
    const renewalRevenue = Math.max(0, totalRevenue - guestRevenue - enrollmentRevenue);

    // 4. Monthly Trends (Mocking historical trend line)
    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];
    const trends = months.map((m, i) => ({
      month: m,
      revenue2024: Math.round(totalRevenue * (0.12 + Math.random() * 0.05)),
      revenue2023: Math.round(totalRevenue * (0.10 + Math.random() * 0.03))
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        enrollmentRevenue,
        renewalRevenue,
        guestRevenue,
        revenueGrowth: "+12.5%",
        trends,
        mix: {
          enrollment: totalRevenue > 0 ? Math.round((enrollmentRevenue / totalRevenue) * 100) : 0,
          renewal: totalRevenue > 0 ? Math.round((renewalRevenue / totalRevenue) * 100) : 0,
          guests: totalRevenue > 0 ? Math.round((guestRevenue / totalRevenue) * 100) : 0
        }
      }
    });
  } catch (error) {
    console.error("Error fetching revenue stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
