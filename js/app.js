// Initialize Supabase client
const supabase = window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);

// Global state
let currentUser = null;
let turnstileToken = null;

// Initialize OneSignal
window.OneSignalDeferred = window.OneSignalDeferred || [];
OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
        appId: CONFIG.oneSignal.appId,
        allowLocalhostAsSecureOrigin: true,
    });
});

// Initialize Turnstile
window.onloadTurnstileCallback = function() {
    if (window.turnstile) {
        window.turnstile.render('#turnstile-widget', {
            sitekey: CONFIG.turnstile.siteKey,
            callback: function(token) {
                turnstileToken = token;
            }
        });
    }
};

// Utility Functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(amount) {
    return `$${parseFloat(amount).toFixed(2)}`;
}

// Authentication Functions
async function login(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        // Get user profile to determine role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) throw profileError;

        currentUser = { ...data.user, ...profile };

        // Subscribe to push notifications
        subscribeToNotifications(currentUser.id);

        // Navigate to appropriate dashboard
        navigateToDashboard(profile.role);

        showToast('Welcome back!', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function register(name, email, phone, password) {
    try {
        console.log('Starting registration...', { name, email, phone });

        // Sign up user
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    phone,
                    role: 'customer'
                },
                emailRedirectTo: window.location.origin
            }
        });

        console.log('Signup response:', { data, error });

        if (error) throw error;

        if (!data.user) {
            throw new Error('User creation failed - no user returned');
        }

        // Check if email confirmation is required
        if (data.user && !data.session) {
            showToast('Check your email to confirm your account!', 'success');
            showScreen('loginScreen');
            return;
        }

        // Create profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: data.user.id,
                name,
                email,
                phone,
                role: 'customer'
            }]);

        console.log('Profile creation:', { profileError });

        if (profileError) {
            console.error('Profile error details:', profileError);
            throw profileError;
        }

        showToast('Account created! Please log in.', 'success');
        showScreen('loginScreen');
    } catch (error) {
        console.error('Registration error:', error);
        showToast(error.message || 'Registration failed. Please try again.', 'error');
    }
}

async function logout() {
    try {
        await supabase.auth.signOut();
        currentUser = null;
        showScreen('loginScreen');
        showToast('Logged out successfully', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function navigateToDashboard(role) {
    switch(role) {
        case 'admin':
            showScreen('adminDashboard');
            loadAdminDashboard();
            break;
        case 'staff':
            showScreen('staffDashboard');
            loadStaffDashboard();
            break;
        case 'customer':
            showScreen('customerDashboard');
            loadCustomerDashboard();
            break;
    }
}

// OneSignal Push Notifications
async function subscribeToNotifications(userId) {
    try {
        if (window.OneSignal) {
            await OneSignal.setExternalUserId(userId);
            await OneSignal.User.PushSubscription.optIn();
        }
    } catch (error) {
        console.error('Notification subscription error:', error);
    }
}

async function sendNotification(userId, title, message) {
    try {
        // Send via OneSignal REST API through Supabase Edge Function
        const { error } = await supabase.functions.invoke('send-notification', {
            body: { userId, title, message }
        });

        if (error) console.error('Notification send error:', error);
    } catch (error) {
        console.error('Notification error:', error);
    }
}

// Admin Dashboard Functions
async function loadAdminDashboard() {
    await loadAdminStats();
    await loadRecentActivity();
    await loadAllOrders();
    await loadStaffList();
    await loadCustomersList();
}

async function loadAdminStats() {
    try {
        // Get total orders
        const { count: totalCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        // Get pending orders
        const { count: pendingCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .in('status', ['pending', 'processing']);

        // Get completed orders
        const { count: completedCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed');

        // Get staff count
        const { count: staffCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'staff');

        document.getElementById('totalOrders').textContent = totalCount || 0;
        document.getElementById('pendingOrders').textContent = pendingCount || 0;
        document.getElementById('completedOrders').textContent = completedCount || 0;
        document.getElementById('totalStaff').textContent = staffCount || 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadRecentActivity() {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                customer:profiles!orders_customer_id_fkey(name),
                staff:profiles!orders_assigned_to_fkey(name)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        const activityList = document.getElementById('recentActivity');

        if (!orders || orders.length === 0) {
            activityList.innerHTML = '<div class="empty-state">No recent activity</div>';
            return;
        }

        activityList.innerHTML = orders.map(order => `
            <div class="activity-item">
                <strong>${order.customer?.name || 'Customer'}</strong> placed an order
                <br><small>${formatDate(order.created_at)}</small>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading activity:', error);
    }
}

async function loadAllOrders() {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                customer:profiles!orders_customer_id_fkey(name, phone),
                staff:profiles!orders_assigned_to_fkey(name)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const ordersList = document.getElementById('adminOrdersList');

        if (!orders || orders.length === 0) {
            ordersList.innerHTML = '<div class="empty-state">No orders yet</div>';
            return;
        }

        ordersList.innerHTML = orders.map(order => {
            const price = (order.weight * SERVICE_PRICING[order.service_type]).toFixed(2);
            return `
                <div class="order-card ${order.status}">
                    <div class="order-header">
                        <div>
                            <div class="order-id">Order #${order.id.slice(0, 8)}</div>
                            <div class="order-info">${order.customer?.name || 'Customer'}</div>
                            <div class="order-info">📞 ${order.customer?.phone || 'N/A'}</div>
                        </div>
                        <span class="status-badge ${order.status}">${order.status}</span>
                    </div>
                    <div class="order-info">🧺 ${SERVICE_NAMES[order.service_type]}</div>
                    <div class="order-info">⚖️ ${order.weight} kg · ${formatCurrency(price)}</div>
                    <div class="order-info">📅 Pickup: ${formatDate(order.pickup_time)}</div>
                    ${order.instructions ? `<div class="order-info">📝 ${order.instructions}</div>` : ''}
                    ${order.staff ? `<div class="order-info">👤 Assigned to: ${order.staff.name}</div>` : ''}
                    <div class="order-actions">
                        ${!order.assigned_to && order.status === 'pending' ?
                            `<button class="btn btn-primary btn-small" onclick="showAssignModal('${order.id}')">Assign to Staff</button>` : ''}
                        ${order.status !== 'completed' && order.status !== 'cancelled' ?
                            `<button class="btn btn-secondary btn-small" onclick="updateOrderStatus('${order.id}', 'cancelled')">Cancel</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function loadStaffList() {
    try {
        const { data: staff, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'staff')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const staffList = document.getElementById('staffList');
        const assignSelect = document.getElementById('assignStaffId');

        if (!staff || staff.length === 0) {
            staffList.innerHTML = '<div class="empty-state">No staff members yet</div>';
            assignSelect.innerHTML = '<option value="">No staff available</option>';
            return;
        }

        // Populate staff list
        staffList.innerHTML = staff.map(member => `
            <div class="staff-card">
                <div class="staff-info">
                    <h4>${member.name}</h4>
                    <p>📧 ${member.email}</p>
                    <p>📞 ${member.phone}</p>
                    <p><small>Joined ${formatDate(member.created_at)}</small></p>
                </div>
            </div>
        `).join('');

        // Populate assign dropdown
        assignSelect.innerHTML = '<option value="">Choose staff...</option>' +
            staff.map(member => `<option value="${member.id}">${member.name}</option>`).join('');
    } catch (error) {
        console.error('Error loading staff:', error);
    }
}

async function loadCustomersList() {
    try {
        const { data: customers, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'customer')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const customersList = document.getElementById('customersList');

        if (!customers || customers.length === 0) {
            customersList.innerHTML = '<div class="empty-state">No customers yet</div>';
            return;
        }

        customersList.innerHTML = customers.map(customer => `
            <div class="customer-card">
                <div class="customer-info">
                    <h4>${customer.name}</h4>
                    <p>📧 ${customer.email}</p>
                    <p>📞 ${customer.phone}</p>
                    <p><small>Member since ${formatDate(customer.created_at)}</small></p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

async function addStaff(name, email, phone, password) {
    try {
        // Create auth user via admin API (requires Edge Function)
        const { data, error } = await supabase.functions.invoke('create-staff-user', {
            body: { name, email, phone, password }
        });

        if (error) throw error;

        showToast('Staff member added successfully!', 'success');
        closeModal('addStaffModal');
        loadStaffList();
        loadAdminStats();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function showAssignModal(orderId) {
    document.getElementById('assignOrderId').value = orderId;
    showModal('assignTaskModal');
}

async function assignTask(orderId, staffId) {
    try {
        const { error } = await supabase
            .from('orders')
            .update({
                assigned_to: staffId,
                status: 'processing'
            })
            .eq('id', orderId);

        if (error) throw error;

        // Get staff info for notification
        const { data: staff } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', staffId)
            .single();

        // Send notification to staff
        await sendNotification(staffId, 'New Task Assigned', `You have been assigned a new laundry order`);

        showToast('Task assigned successfully!', 'success');
        closeModal('assignTaskModal');
        loadAllOrders();
        loadAdminStats();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Staff Dashboard Functions
async function loadStaffDashboard() {
    await loadStaffTasks();
}

async function loadStaffTasks() {
    try {
        const { data: tasks, error } = await supabase
            .from('orders')
            .select(`
                *,
                customer:profiles!orders_customer_id_fkey(name, phone)
            `)
            .eq('assigned_to', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const activeTasks = tasks?.filter(t => t.status !== 'completed' && t.status !== 'cancelled') || [];
        const completedTasks = tasks?.filter(t => t.status === 'completed' || t.status === 'cancelled') || [];

        // Active tasks
        const tasksList = document.getElementById('staffTasksList');
        if (activeTasks.length === 0) {
            tasksList.innerHTML = '<div class="empty-state">No active tasks</div>';
        } else {
            tasksList.innerHTML = activeTasks.map(task => renderTaskCard(task)).join('');
        }

        // Completed tasks
        const completedList = document.getElementById('staffCompletedList');
        if (completedTasks.length === 0) {
            completedList.innerHTML = '<div class="empty-state">No completed tasks</div>';
        } else {
            completedList.innerHTML = completedTasks.map(task => renderTaskCard(task, true)).join('');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function renderTaskCard(task, isCompleted = false) {
    const price = (task.weight * SERVICE_PRICING[task.service_type]).toFixed(2);
    return `
        <div class="task-card ${task.status}">
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${task.id.slice(0, 8)}</div>
                    <div class="order-info"><strong>${task.customer?.name || 'Customer'}</strong></div>
                    <div class="order-info">📞 ${task.customer?.phone || 'N/A'}</div>
                </div>
                <span class="status-badge ${task.status}">${task.status}</span>
            </div>
            <div class="order-info">🧺 ${SERVICE_NAMES[task.service_type]}</div>
            <div class="order-info">⚖️ ${task.weight} kg · ${formatCurrency(price)}</div>
            <div class="order-info">📅 Pickup: ${formatDate(task.pickup_time)}</div>
            ${task.instructions ? `<div class="order-info">📝 ${task.instructions}</div>` : ''}
            ${!isCompleted ? `
                <div class="order-actions">
                    <button class="btn btn-primary btn-small" onclick="updateOrderStatus('${task.id}', 'completed')">Mark Complete</button>
                </div>
            ` : ''}
        </div>
    `;
}

// Customer Dashboard Functions
async function loadCustomerDashboard() {
    await loadCustomerOrders();
    setMinPickupTime();
}

function setMinPickupTime() {
    const now = new Date();
    now.setHours(now.getHours() + 2); // Minimum 2 hours from now
    const minTime = now.toISOString().slice(0, 16);
    document.getElementById('pickupTime').min = minTime;
}

async function loadCustomerOrders() {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                *,
                staff:profiles!orders_assigned_to_fkey(name)
            `)
            .eq('customer_id', currentUser.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const ordersList = document.getElementById('customerOrdersList');

        if (!orders || orders.length === 0) {
            ordersList.innerHTML = '<div class="empty-state">No orders yet. Book your first service!</div>';
            return;
        }

        ordersList.innerHTML = orders.map(order => {
            const price = (order.weight * SERVICE_PRICING[order.service_type]).toFixed(2);
            return `
                <div class="order-card ${order.status}">
                    <div class="order-header">
                        <div>
                            <div class="order-id">Order #${order.id.slice(0, 8)}</div>
                            <div class="order-info">${formatDate(order.created_at)}</div>
                        </div>
                        <span class="status-badge ${order.status}">${order.status}</span>
                    </div>
                    <div class="order-info">🧺 ${SERVICE_NAMES[order.service_type]}</div>
                    <div class="order-info">⚖️ ${order.weight} kg · ${formatCurrency(price)}</div>
                    <div class="order-info">📅 Pickup: ${formatDate(order.pickup_time)}</div>
                    ${order.instructions ? `<div class="order-info">📝 ${order.instructions}</div>` : ''}
                    ${order.staff ? `<div class="order-info">👤 Handled by: ${order.staff.name}</div>` : ''}
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function createOrder(serviceType, weight, pickupTime, instructions) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .insert([{
                customer_id: currentUser.id,
                service_type: serviceType,
                weight: parseFloat(weight),
                pickup_time: pickupTime,
                instructions: instructions,
                status: 'pending'
            }])
            .select()
            .single();

        if (error) throw error;

        // Notify admin about new order
        const { data: admins } = await supabase
            .from('profiles')
            .select('id')
            .eq('role', 'admin');

        if (admins) {
            for (const admin of admins) {
                await sendNotification(admin.id, 'New Order', `${currentUser.name} placed a new order`);
            }
        }

        showToast('Order placed successfully!', 'success');
        document.getElementById('newOrderForm').reset();
        setMinPickupTime();

        // Switch to orders tab
        switchTab('myOrders');
        loadCustomerOrders();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*, customer:profiles!orders_customer_id_fkey(id, name)')
            .eq('id', orderId)
            .single();

        if (fetchError) throw fetchError;

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) throw error;

        // Notify customer about status change
        let notifMessage = '';
        switch(newStatus) {
            case 'completed':
                notifMessage = 'Your laundry is ready for pickup!';
                break;
            case 'cancelled':
                notifMessage = 'Your order has been cancelled';
                break;
            default:
                notifMessage = `Your order status: ${newStatus}`;
        }

        await sendNotification(order.customer.id, 'Order Update', notifMessage);

        showToast('Order status updated!', 'success');

        // Reload appropriate data
        if (currentUser.role === 'admin') {
            loadAllOrders();
            loadAdminStats();
        } else if (currentUser.role === 'staff') {
            loadStaffTasks();
        }
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Tab switching
function switchTab(tabName) {
    // Get all tabs and tab contents in current dashboard
    const activeDashboard = document.querySelector('.dashboard.active');
    const tabs = activeDashboard.querySelectorAll('.tab');
    const tabContents = activeDashboard.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    tabContents.forEach(content => {
        if (content.id === tabName + 'Tab') {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profile) {
                currentUser = { ...session.user, ...profile };
                navigateToDashboard(profile.role);
            }
        }
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!turnstileToken) {
            showToast('Please complete the security check', 'error');
            return;
        }

        await login(email, password);
    });

    // Register form
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const password = document.getElementById('regPassword').value;

        await register(name, email, phone, password);
    });

    // Show register screen
    document.getElementById('showRegisterBtn').addEventListener('click', () => {
        showScreen('registerScreen');
    });

    // Back to login
    document.getElementById('backToLoginBtn').addEventListener('click', () => {
        showScreen('loginScreen');
    });

    // Logout buttons
    document.getElementById('adminLogout')?.addEventListener('click', logout);
    document.getElementById('staffLogout')?.addEventListener('click', logout);
    document.getElementById('customerLogout')?.addEventListener('click', logout);

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });

    // New order form
    document.getElementById('newOrderForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const serviceType = document.getElementById('serviceType').value;
        const weight = document.getElementById('weight').value;
        const pickupTime = document.getElementById('pickupTime').value;
        const instructions = document.getElementById('instructions').value;

        await createOrder(serviceType, weight, pickupTime, instructions);
    });

    // Add staff modal
    document.getElementById('addStaffBtn')?.addEventListener('click', () => {
        showModal('addStaffModal');
    });

    document.getElementById('addStaffForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('staffName').value;
        const email = document.getElementById('staffEmail').value;
        const phone = document.getElementById('staffPhone').value;
        const password = document.getElementById('staffPassword').value;

        await addStaff(name, email, phone, password);
    });

    // Assign task form
    document.getElementById('assignTaskForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const orderId = document.getElementById('assignOrderId').value;
        const staffId = document.getElementById('assignStaffId').value;

        if (!staffId) {
            showToast('Please select a staff member', 'error');
            return;
        }

        await assignTask(orderId, staffId);
    });

    // Close modals
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.remove('active');
        });
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // Real-time subscriptions
    supabase
        .channel('orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
            // Reload data when orders change
            if (currentUser) {
                if (currentUser.role === 'admin') {
                    loadAdminDashboard();
                } else if (currentUser.role === 'staff') {
                    loadStaffTasks();
                } else if (currentUser.role === 'customer') {
                    loadCustomerOrders();
                }
            }
        })
        .subscribe();
});

// Make functions globally accessible for onclick handlers
window.showAssignModal = showAssignModal;
window.updateOrderStatus = updateOrderStatus;
