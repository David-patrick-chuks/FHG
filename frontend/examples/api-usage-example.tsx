// /**
//  * Example React components showing how to use the integrated APIs
//  * This file demonstrates the complete integration of backend APIs in frontend
//  */

// import {
//     AuthAPI,
//     BotsAPI,
//     CampaignsAPI,
//     DashboardAPI,
//     SubscriptionsAPI,
//     TrackingAPI
// } from '@/lib/api';
// import { Bot, Campaign, TrackingStats, User } from '@/types';
// import React, { useEffect, useState } from 'react';

// // Example: Bot Management Component
// export const BotManagementExample: React.FC = () => {
//   const [bots, setBots] = useState<Bot[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Load bots on component mount
//   useEffect(() => {
//     loadBots();
//   }, []);

//   const loadBots = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const response = await BotsAPI.getBots({ page: 1, limit: 10 });
      
//       if (response.success && response.data) {
//         setBots(response.data.data);
//       } else {
//         setError(response.message || 'Failed to load bots');
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createBot = async (botData: any) => {
//     try {
//       setLoading(true);
      
//       // First test credentials
//       const testResult = await BotsAPI.testCredentials({
//         email: botData.email,
//         password: botData.password
//       });

//       if (!testResult.success || !testResult.data?.verified) {
//         throw new Error('Invalid credentials');
//       }

//       // Create bot if credentials are valid
//       const response = await BotsAPI.createBot(botData);
      
//       if (response.success && response.data) {
//         setBots(prev => [response.data!, ...prev]);
//         return response.data;
//       } else {
//         throw new Error(response.message || 'Failed to create bot');
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to create bot');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleBotStatus = async (botId: string) => {
//     try {
//       const response = await BotsAPI.toggleBotStatus(botId);
      
//       if (response.success && response.data) {
//         setBots(prev => prev.map(bot => 
//           bot._id === botId ? response.data! : bot
//         ));
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to toggle bot status');
//     }
//   };

//   const getBotStats = async (botId: string) => {
//     try {
//       const [stats, emailStats] = await Promise.all([
//         BotsAPI.getBotStats(botId),
//         BotsAPI.getBotEmailStats(botId, 30)
//       ]);

//       return {
//         stats: stats.data,
//         emailStats: emailStats.data
//       };
//     } catch (err) {
//       console.error('Failed to get bot stats:', err);
//       return null;
//     }
//   };

//   return (
//     <div>
//       <h2>Bot Management</h2>
      
//       {loading && <p>Loading...</p>}
//       {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
//       <div>
//         {bots.map(bot => (
//           <div key={bot._id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
//             <h3>{bot.name}</h3>
//             <p>Status: {bot.isActive ? 'Active' : 'Inactive'}</p>
//             <p>Daily Emails: {bot.dailyEmailCount}</p>
//             <button onClick={() => toggleBotStatus(bot._id)}>
//               {bot.isActive ? 'Deactivate' : 'Activate'}
//             </button>
//             <button onClick={() => getBotStats(bot._id)}>
//               Get Stats
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // Example: Campaign Management Component
// export const CampaignManagementExample: React.FC = () => {
//   const [campaigns, setCampaigns] = useState<Campaign[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     loadCampaigns();
//   }, []);

//   const loadCampaigns = async () => {
//     try {
//       setLoading(true);
//       const response = await CampaignsAPI.getCampaigns({ page: 1, limit: 10 });
      
//       if (response.success && response.data) {
//         setCampaigns(response.data.data);
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to load campaigns');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const createCampaign = async (campaignData: any) => {
//     try {
//       setLoading(true);
      
//       const response = await CampaignsAPI.createCampaign(campaignData);
      
//       if (response.success && response.data) {
//         setCampaigns(prev => [response.data!, ...prev]);
//         return response.data;
//       } else {
//         throw new Error(response.message || 'Failed to create campaign');
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to create campaign');
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startCampaign = async (campaignId: string) => {
//     try {
//       const response = await CampaignsAPI.startCampaign(campaignId);
      
//       if (response.success && response.data) {
//         setCampaigns(prev => prev.map(campaign => 
//           campaign._id === campaignId ? response.data! : campaign
//         ));
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to start campaign');
//     }
//   };

//   const getTrackingStats = async (campaignId: string): Promise<TrackingStats | null> => {
//     try {
//       const response = await CampaignsAPI.getCampaignTrackingStats(campaignId);
//       return response.success ? response.data || null : null;
//     } catch (err) {
//       console.error('Failed to get tracking stats:', err);
//       return null;
//     }
//   };

//   const uploadEmailFile = async (file: File) => {
//     try {
//       const response = await CampaignsAPI.uploadEmailFile(file, (progress) => {
//         console.log(`Upload progress: ${progress}%`);
//       });
      
//       if (response.success && response.data) {
//         return response.data.emails;
//       } else {
//         throw new Error(response.message || 'Failed to upload file');
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to upload file');
//       throw err;
//     }
//   };

//   return (
//     <div>
//       <h2>Campaign Management</h2>
      
//       {loading && <p>Loading...</p>}
//       {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
//       <div>
//         {campaigns.map(campaign => (
//           <div key={campaign._id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
//             <h3>{campaign.name}</h3>
//             <p>Status: {campaign.status}</p>
//             <p>Emails: {campaign.emailList.length}</p>
//             <p>Bot: {campaign.botId}</p>
            
//             <button onClick={() => startCampaign(campaign._id)}>
//               Start Campaign
//             </button>
//             <button onClick={() => getTrackingStats(campaign._id)}>
//               Get Tracking Stats
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // Example: Dashboard Component
// export const DashboardExample: React.FC = () => {
//   const [dashboardData, setDashboardData] = useState<any>(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     loadDashboardData();
//   }, []);

//   const loadDashboardData = async () => {
//     try {
//       setLoading(true);
      
//       // Load all dashboard data in parallel
//       const [stats, activity, overview] = await Promise.all([
//         DashboardAPI.getDashboardStats(),
//         DashboardAPI.getRecentActivity(),
//         DashboardAPI.getQuickOverview()
//       ]);

//       setDashboardData({
//         stats: stats.data,
//         activity: activity.data,
//         overview: overview.data
//       });
//     } catch (err) {
//       console.error('Failed to load dashboard data:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getUserTrackingSummary = async () => {
//     try {
//       const response = await TrackingAPI.getUserTrackingSummary();
//       return response.success ? response.data : null;
//     } catch (err) {
//       console.error('Failed to get tracking summary:', err);
//       return null;
//     }
//   };

//   if (loading) return <p>Loading dashboard...</p>;

//   return (
//     <div>
//       <h2>Dashboard</h2>
      
//       {dashboardData && (
//         <div>
//           <div>
//             <h3>Statistics</h3>
//             <p>Total Campaigns: {dashboardData.stats?.totalCampaigns}</p>
//             <p>Active Campaigns: {dashboardData.stats?.activeCampaigns}</p>
//             <p>Total Emails Sent: {dashboardData.stats?.totalEmailsSent}</p>
//             <p>Average Open Rate: {dashboardData.stats?.averageOpenRate}%</p>
//           </div>
          
//           <div>
//             <h3>Recent Activity</h3>
//             {dashboardData.activity?.map((activity: any) => (
//               <div key={activity.id}>
//                 <p>{activity.description} - {new Date(activity.timestamp).toLocaleString()}</p>
//               </div>
//             ))}
//           </div>
          
//           <div>
//             <h3>Quick Overview</h3>
//             <p>Total Bots: {dashboardData.overview?.totalBots}</p>
//             <p>Active Bots: {dashboardData.overview?.activeBots}</p>
//             <p>Emails Sent Today: {dashboardData.overview?.emailsSentToday}</p>
//           </div>
//         </div>
//       )}
      
//       <button onClick={getUserTrackingSummary}>
//         Get Tracking Summary
//       </button>
//     </div>
//   );
// };

// // Example: Authentication Component
// export const AuthenticationExample: React.FC = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(false);

//   const login = async (email: string, password: string) => {
//     try {
//       setLoading(true);
      
//       const response = await AuthAPI.login({ email, password });
      
//       if (response.success && response.data) {
//         setUser(response.data.user);
//         // Store token in localStorage
//         localStorage.setItem('auth_token', response.data.token);
//         return response.data;
//       } else {
//         throw new Error(response.message || 'Login failed');
//       }
//     } catch (err) {
//       console.error('Login error:', err);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = async () => {
//     try {
//       await AuthAPI.logout();
//       setUser(null);
//       localStorage.removeItem('auth_token');
//     } catch (err) {
//       console.error('Logout error:', err);
//     }
//   };

//   const getProfile = async () => {
//     try {
//       const response = await AuthAPI.getProfile();
      
//       if (response.success && response.data) {
//         setUser(response.data);
//         return response.data;
//       }
//     } catch (err) {
//       console.error('Failed to get profile:', err);
//     }
//   };

//   const getUserStats = async () => {
//     try {
//       const response = await AuthAPI.getUserStats();
//       return response.success ? response.data : null;
//     } catch (err) {
//       console.error('Failed to get user stats:', err);
//       return null;
//     }
//   };

//   return (
//     <div>
//       <h2>Authentication</h2>
      
//       {loading && <p>Loading...</p>}
      
//       {user ? (
//         <div>
//           <p>Welcome, {user.username}!</p>
//           <p>Email: {user.email}</p>
//           <p>Subscription: {user.subscription}</p>
//           <button onClick={logout}>Logout</button>
//           <button onClick={getProfile}>Refresh Profile</button>
//           <button onClick={getUserStats}>Get User Stats</button>
//         </div>
//       ) : (
//         <div>
//           <p>Please log in</p>
//           <button onClick={() => login('user@example.com', 'password')}>
//             Login
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// // Example: Subscription Management Component
// export const SubscriptionExample: React.FC = () => {
//   const [subscriptions, setSubscriptions] = useState<any[]>([]);
//   const [activeSubscription, setActiveSubscription] = useState<any>(null);

//   useEffect(() => {
//     loadSubscriptions();
//   }, []);

//   const loadSubscriptions = async () => {
//     try {
//       const [subsResponse, activeResponse] = await Promise.all([
//         SubscriptionsAPI.getUserSubscriptions(),
//         SubscriptionsAPI.getActiveSubscription()
//       ]);

//       if (subsResponse.success && subsResponse.data) {
//         setSubscriptions(subsResponse.data);
//       }

//       if (activeResponse.success && activeResponse.data) {
//         setActiveSubscription(activeResponse.data);
//       }
//     } catch (err) {
//       console.error('Failed to load subscriptions:', err);
//     }
//   };

//   const createSubscription = async (subscriptionData: any) => {
//     try {
//       const response = await SubscriptionsAPI.createSubscription(subscriptionData);
      
//       if (response.success && response.data) {
//         setSubscriptions(prev => [response.data!, ...prev]);
//         return response.data;
//       }
//     } catch (err) {
//       console.error('Failed to create subscription:', err);
//     }
//   };

//   const renewSubscription = async (subscriptionId: string, duration: number) => {
//     try {
//       const response = await SubscriptionsAPI.renewSubscription(subscriptionId, duration);
      
//       if (response.success && response.data) {
//         setSubscriptions(prev => prev.map(sub => 
//           sub._id === subscriptionId ? response.data! : sub
//         ));
//       }
//     } catch (err) {
//       console.error('Failed to renew subscription:', err);
//     }
//   };

//   return (
//     <div>
//       <h2>Subscription Management</h2>
      
//       {activeSubscription && (
//         <div>
//           <h3>Active Subscription</h3>
//           <p>Tier: {activeSubscription.tier}</p>
//           <p>Status: {activeSubscription.status}</p>
//           <p>End Date: {new Date(activeSubscription.endDate).toLocaleDateString()}</p>
//         </div>
//       )}
      
//       <div>
//         <h3>All Subscriptions</h3>
//         {subscriptions.map(subscription => (
//           <div key={subscription._id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
//             <p>Tier: {subscription.tier}</p>
//             <p>Status: {subscription.status}</p>
//             <p>Amount: {subscription.amount}</p>
//             <button onClick={() => renewSubscription(subscription._id, 12)}>
//               Renew for 12 months
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // Main example component that combines all APIs
// export const CompleteAPIExample: React.FC = () => {
//   return (
//     <div>
//       <h1>Complete API Integration Example</h1>
      
//       <AuthenticationExample />
//       <hr />
      
//       <BotManagementExample />
//       <hr />
      
//       <CampaignManagementExample />
//       <hr />
      
//       <DashboardExample />
//       <hr />
      
//       <SubscriptionExample />
//     </div>
//   );
// };

// export default CompleteAPIExample;
