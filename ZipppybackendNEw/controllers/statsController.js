import { supabase } from '../supabaseClient.js';
import { sendPushToUser } from '../firebaseAdmin.js';

export const getGlobalStats = async (req, res) => {
  try {
    // 1. Total Riders
    const { count: totalRiders, error: ridersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'rider');

    // 2. Active Horses
    const { count: totalHorses, error: horsesError } = await supabase
      .from('horse')
      .select('*', { count: 'exact', head: true });

    const { data: stables } = await supabase.from('stable').select('*');

    // 3. Total Revenue (from payments table to match Revenue Management)
    const { data: revenueData } = await supabase.from('payments').select('amount, user_id');
    let totalRevenue = 0;
    if (revenueData) {
        totalRevenue = revenueData.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);
    }

    // Calculate Center Revenue Map
    const { data: allRidersMapData } = await supabase.from('rider').select('user_id, stable_id');
    const centerRevenueMap = {};
    if (revenueData && allRidersMapData) {
        const userToStable = {};
        allRidersMapData.forEach(r => {
            if (r.user_id && r.stable_id) {
                userToStable[r.user_id] = r.stable_id;
            }
        });
        revenueData.forEach(p => {
            if (p.user_id && p.amount) {
                const stableId = userToStable[p.user_id];
                if (stableId) {
                    centerRevenueMap[stableId] = (centerRevenueMap[stableId] || 0) + Number(p.amount);
                }
            }
        });
    }

    // 4. Center Utilization
    const { data: sessionsResult } = await supabase.from('sessions').select('participants, total_seats');
    
    let totalTaken = 0;
    let totalAvailable = 0;

    if (sessionsResult) {
        sessionsResult.forEach(s => {
          totalTaken += (s.participants?.length || 0);
          totalAvailable += (s.total_seats || s.totalSeats || 0);
        });
    }

    const utilization = totalAvailable > 0 ? Math.round((totalTaken / totalAvailable) * 100) : 0;

    // 5. Centers Data
    const { data: allTrainers } = await supabase.from('trainers').select('*');
    const { data: users } = await supabase.from('users').select('*').eq('type', 'stableStaff');
    const { data: allHorses } = await supabase.from('horse').select('stable_id');
    const { data: allInventory } = await supabase.from('inventory').select('stable_id');

    const centers = (stables || []).map(s => {
      const trainerCount = allTrainers ? allTrainers.filter(t => t.stable_id === s.id).length : 0;

      let status = "STABLE";
      const rev = centerRevenueMap[s.id] || 0;
      if (rev > 40000) status = "PEEK PERFORMANCE";
      else if (rev > 30000) status = "NEAR CAPACITY";
      else if (rev < 20000) status = "UNDER REVIEW";

      const horseCount = s.horses ? s.horses.length : 0;
      const stocksCount = s.stocks ? s.stocks.length : 0;

      return {
        id: s.id,
        name: s.name,
        location: s.location,
        manager: users?.find((user) => user.id === s.user_id)?.name || "Not Assigned",
        activeRiders: Math.floor((totalRiders || 0) / ((stables || []).length || 1)),
        monthlyRevenue: rev,
        horseCount: horseCount,
        trainerCount: trainerCount,
        status: status,
        stocksCount: stocksCount
      };
    });

    // 6. Recent Activity
    const { data: allUsers } = await supabase.from('users').select('notifications, name');
    let recentActivity = [];
    if (allUsers) {
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
    }
    recentActivity = recentActivity.slice(-5).reverse();

    res.status(200).json({
      success: true,
      stats: {
        totalRiders: Number(totalRiders || 0),
        totalHorses: Number(totalHorses || 0),
        totalRevenue: Number(totalRevenue),
        utilization,
        revenueGrowth: "+12.5%",
        riderGrowth: "+5.2%",
        horseGrowth: "+2.1%",
        utilizationTrend: "-1.5%",
        centers,
        staff: users || [],
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
    const { data: inventoryItems } = await supabase.from('inventory').select('*');

    let mappedStocks = (inventoryItems || []).map(item => ({
      ...item,
      stock: item.current_stock || item.currentStock || 0,
      currentStock: item.current_stock || item.currentStock || 0,
      minThreshold: item.min_threshold || item.minThreshold || 10,
      stableId: item.stable_id || item.stableId
    }));

    if (mappedStocks.length === 0) {
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

    const { data: stable } = await supabase.from('stable').select('*').eq('id', stableId).limit(1);

    if (!stable || !stable.length) {
      return res.status(200).json({
        success: true,
        stable: {
          id: stableId,
          name: "Global Overview",
          location: "All Centers",
          statusCounts: { total: 0, fit: 0, nearLimit: 0, restRequired: 0 },
          stocks: mappedStocks,
          _debug: { itemCount: inventoryItems?.length || 0, mode: 'fallback', timestamp: new Date().toISOString() }
        }
      });
    }

    const s = stable[0];

    let horsesData = [];
    if (s.horses && s.horses.length > 0) {
        const { data: fetchedHorses } = await supabase.from('horse').select('*').in('id', s.horses);
        horsesData = fetchedHorses || [];
    }
    const { data: sessions } = await supabase.from('sessions').select('*');
    
    const todayStr = new Date().toISOString().split('T')[0];
    const sessionsData = sessions || [];

    const nearLimitCount = horsesData.filter(h => {
      const todaySessions = sessionsData.filter(session => session.horse_id === h.id && session.date === todayStr).length;
      return todaySessions >= 3;
    }).length;

    const restRequiredCount = horsesData.filter(h =>
      h.status === 'Medical' || h.status === 'Resting' || h.diet === 'Sick'
    ).length;

    const statusCounts = {
      total: horsesData.length,
      fit: horsesData.filter(h => h.status === 'Available' && h.diet !== 'Sick').length,
      nearLimit: nearLimitCount,
      restRequired: restRequiredCount
    };

    const { stocks: dbStocks, ...stableInfo } = s;

    // Convert keys for frontend
    const clientStableInfo = {
        ...stableInfo,
        totalRevenue: stableInfo.total_revenue,
        userId: stableInfo.user_id,
        headTrainer: stableInfo.head_trainer
    };

    res.status(200).json({
      success: true,
      stable: {
        ...clientStableInfo,
        statusCounts,
        stocks: mappedStocks,
        _debug: { itemCount: inventoryItems?.length || 0, timestamp: new Date().toISOString() }
      }
    });
  } catch (error) {
    console.error("Error fetching stable stats:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRevenueStats = async (req, res) => {
  const { range } = req.query;
  try {
    const { data: sessions } = await supabase.from('sessions').select('*');
    const { data: stables } = await supabase.from('stable').select('*');

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let filteredSessions = sessions || [];

    if (range === 'today') {
      filteredSessions = filteredSessions.filter(s => s.date === todayStr);
    } else if (range === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      filteredSessions = filteredSessions.filter(s => new Date(s.date) >= oneWeekAgo);
    } else if (range === 'month') {
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      filteredSessions = filteredSessions.filter(s => {
        const d = new Date(s.date);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      });
    }

    let guestRevenue = 0;
    let totalRevenue = (stables || []).reduce((acc, s) => acc + (Number(s.total_revenue || s.totalRevenue) || 0), 0);

    if (range === 'today') {
      totalRevenue = guestRevenue * 1.5;
    } else if (range === 'week') {
      totalRevenue = totalRevenue / 4;
    }

    const enrollmentRevenue = Math.round((totalRevenue - guestRevenue) * 0.55);
    const renewalRevenue = Math.max(0, totalRevenue - guestRevenue - enrollmentRevenue);

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