import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// JSON database file location
const DB_FILE = path.join(process.cwd(), 'database.json');

// Interface representation matching our DB
interface DatabaseSchema {
  users: any[];
  roles: any[];
  departments: any[];
  projects: any[];
  sessions: any[];
  activityLogs: any[];
  emailTemplates: any[];
  generatedModels: any[];
  dynamicRecords: any[];
}

// Initial Database Seeder Content (Using default password '12345678')
const INITIAL_DATABASE: DatabaseSchema = {
  users: [
    { id: 'u_1', username: 'admin', email: 'tadesseamsalu@gmail.com', name: 'System Admin', roleId: 'role_admin', departmentId: 'dept_eng', isActive: true, createdAt: '2026-05-15T08:00:00Z' },
    { id: 'u_2', username: 'pm_john', email: 'john@example.com', name: 'John Smith (PM)', roleId: 'role_pm', departmentId: 'dept_eng', isActive: true, createdAt: '2026-05-16T10:30:00Z' },
    { id: 'u_3', username: 'pm_sarah', email: 'sarah@example.com', name: 'Sarah Connor (PM)', roleId: 'role_pm', departmentId: 'dept_mkt', isActive: true, createdAt: '2026-05-17T09:15:00Z' },
    { id: 'u_4', username: 'user_tadesse', email: 'tadesse_member@example.com', name: 'Tadesse Amsalu', roleId: 'role_member', departmentId: 'dept_eng', isActive: true, createdAt: '2026-05-18T14:45:00Z' },
    { id: 'u_5', username: 'user_lucas', email: 'lucas@example.com', name: 'Lucas Vance', roleId: 'role_member', departmentId: 'dept_mkt', isActive: true, createdAt: '2026-05-19T11:20:00Z' }
  ],
  roles: [
    { id: 'role_admin', name: 'Administrator', description: 'Full access to all system features, CRUD templates, and roles management.', permissions: ['view_dashboard', 'manage_users', 'manage_roles', 'crud_generate', 'manage_projects', 'manage_departments', 'view_audits', 'edit_templates'] },
    { id: 'role_pm', name: 'Project Manager', description: 'Can view dashboard, manage departments, manage projects, and audit activities.', permissions: ['view_dashboard', 'manage_projects', 'manage_departments', 'view_audits'] },
    { id: 'role_member', name: 'Team Member', description: 'Standard read-only dashboard viewer, can participate in projects.', permissions: ['view_dashboard'] }
  ],
  departments: [
    { id: 'dept_eng', name: 'Engineering', description: 'Main architecture, tech stack development, and DevOps systems.', createdAt: '2026-05-01T08:00:00Z' },
    { id: 'dept_mkt', name: 'Marketing', description: 'Creative outreach, digital ads, SEO, and product branding.', createdAt: '2026-05-01T08:00:00Z' },
    { id: 'dept_hr', name: 'Human Resources', description: 'Personnel, recruiting, performance reviews, and employee benefits.', createdAt: '2026-05-01T08:00:00Z' }
  ],
  projects: [
    { id: 'p_1', name: 'Enterprise Portal Build', description: 'Deploy AdminLTE React Dashboard with live project monitoring widgets and analytics tracking.', departmentId: 'dept_eng', managerId: 'u_2', memberIds: ['u_4', 'u_1'], status: 'active', createdAt: '2026-05-20T09:00:00Z' },
    { id: 'p_2', name: 'Main Database Audit', description: 'Deep audit and optimization of storage mechanisms and database speed indexers.', departmentId: 'dept_eng', managerId: 'u_2', memberIds: [], status: 'planning', createdAt: '2026-05-22T10:00:00Z' },
    { id: 'p_3', name: 'Product Q3 Visual Design', description: 'Design assets, landing page high fidelity designs, and promo vector bundles.', departmentId: 'dept_mkt', managerId: 'u_3', memberIds: ['u_5'], status: 'active', createdAt: '2026-05-21T11:00:00Z' }
  ],
  sessions: [
    { id: 'sess_1', userId: 'u_1', username: 'admin', name: 'System Admin', ipAddress: '192.168.1.52', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/121.0.0.0', loginTime: '2026-06-01T14:40:00Z', isCurrent: false },
    { id: 'sess_2', userId: 'u_2', username: 'pm_john', name: 'John Smith (PM)', ipAddress: '192.168.1.104', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/122.0', loginTime: '2026-06-01T13:10:00Z', isCurrent: false },
    { id: 'sess_3', userId: 'u_4', username: 'user_tadesse', name: 'Tadesse Amsalu', ipAddress: '10.0.8.214', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) Safari/605.1', loginTime: '2026-06-01T14:15:00Z', isCurrent: false }
  ],
  activityLogs: [
    { id: 'log_1', userId: 'u_1', userEmail: 'tadesseamsalu@gmail.com', username: 'admin', action: 'database_initiated', entity: 'system', details: 'Database initialized and seeded successfully.', timestamp: '2026-05-15T08:02:15Z', ipAddress: '127.0.0.1', type: 'success' },
    { id: 'log_2', userId: 'u_1', userEmail: 'tadesseamsalu@gmail.com', username: 'admin', action: 'role_create', entity: 'role', details: 'Created role: Team Member with default dashboard accesses', timestamp: '2026-05-15T08:10:11Z', ipAddress: '127.0.0.1', type: 'info' },
    { id: 'log_3', userId: 'u_2', userEmail: 'john@example.com', username: 'pm_john', action: 'project_member_add', entity: 'project', details: 'Tadesse Amsalu joined project Enterprise Portal Build', timestamp: '2026-05-20T10:15:00Z', ipAddress: '192.168.1.104', type: 'success' },
    { id: 'log_4', userId: 'u_1', userEmail: 'tadesseamsalu@gmail.com', username: 'admin', action: 'department_create', entity: 'department', details: 'Created department Engineering with code DEPT_ENG', timestamp: '2026-05-15T08:05:00Z', ipAddress: '127.0.0.1', type: 'info' }
  ],
  emailTemplates: [
    {
      id: 'temp_forgot',
      name: 'Forgot Password Recovery',
      subject: 'Password Recovery Request - Enterprise Control Panel',
      body: 'Hello {{name}},\n\nWe received a request to recover the password for your account (username: {{username}}).\n\nIf you made this request, please click the secure recovery link below to set your new password:\n{{recovery_link}}\n\nThis recovery link is valid for 1 hour.\n\nIP Address of Request: {{ip_address}}\n\nIf you did not initiate this recovery, please secure your email account and contact the IT Department.\n\nBest Regards,\nSystem Security Team',
      placeholders: ['name', 'username', 'recovery_link', 'ip_address'],
      updatedAt: '2026-05-20T08:00:00Z'
    },
    {
      id: 'temp_pm_assigned',
      name: 'Project Manager Assignment',
      subject: 'New Assignment: Managing Project {{project_name}}',
      body: 'Hello {{name}},\n\nYou have been officially assigned as the Project Manager for the project "{{project_name}}" under the {{department_name}} department.\n\nProject details:\nDescription: {{project_desc}}\nLaunch Date: {{launch_date}}\n\nPlease review your dashboard and assign team members as required to stay on schedule.\n\nBest Regards,\nOperations Directorate',
      placeholders: ['name', 'project_name', 'department_name', 'project_desc', 'launch_date'],
      updatedAt: '2026-05-21T09:30:00Z'
    },
    {
      id: 'temp_crud_created',
      name: 'CRUD Resource Generated Alert',
      subject: 'Alert: Custom Dynamic CRUD Generated - {{model_name}}',
      body: 'Hello System Administrator,\n\nA new Model and associated MVC routes have been successfully scaffolded.\n\nCRUD Details:\nModel Name: {{model_name}}\nDatabase Fields: {{fields_list}}\nGenerated Code Output: CJS / TS React views\n\nThe UI has refreshed to catalog the new sidebar item. You can now use the interactive grid directly.\n\nBest Regards,\nCRUD Code-Gen Daemon',
      placeholders: ['model_name', 'fields_list'],
      updatedAt: '2026-05-25T11:20:00Z'
    }
  ],
  generatedModels: [
    {
      id: 'm_seed_inventory',
      name: 'Inventory',
      p_plural: 'inventories',
      label: 'Inventory Asset',
      fields: [
        { name: 'item_name', type: 'text', required: true, label: 'Asset Name' },
        { name: 'stock_qty', type: 'number', required: true, label: 'Stock Quantity' },
        { name: 'cost_usd', type: 'number', required: false, label: 'Unit Cost ($)' },
        { name: 'arrival_date', type: 'date', required: false, label: 'Date Received' },
        { name: 'is_active', type: 'boolean', required: true, label: 'In Commission' }
      ],
      createdAt: '2026-05-25T14:00:00Z',
      controllerCode: `class InventoryController {\n  async index(req, res) {\n    return res.json(await DB.dynamicRecords.filter(r => r.modelId === "m_seed_inventory"));\n  }\n  async create(req, res) {\n    const newRecord = { id: 'rec_' + Date.now(), modelId: "m_seed_inventory", data: req.body, createdAt: new Date() };\n    DB.dynamicRecords.push(newRecord);\n    return res.status(201).json(newRecord);\n  }\n}`,
      modelCode: `import mongoose from 'mongoose';\nconst InventorySchema = new mongoose.Schema({\n  item_name: { type: String, required: true },\n  stock_qty: { type: Number, required: true },\n  cost_usd: { type: Number },\n  arrival_date: { type: Date },\n  is_active: { type: Boolean, default: true }\n});`,
      viewCode: `<div>React Grid Table showing Item Name, Stock Qty, and Cost USD</div>`,
      routeCode: `Route::resource('inventories', 'InventoryController');`,
      migrationCode: `Schema::create('inventories', function (Blueprint $table) {\n  $table->id();\n  $table->string('item_name');\n  $table->integer('stock_qty');\n  $table->decimal('cost_usd', 10, 2)->nullable();\n  $table->date('arrival_date')->nullable();\n  $table->boolean('is_active')->default(true);\n  $table->timestamps();\n});`
    }
  ],
  dynamicRecords: [
    { id: 'rec_101', modelId: 'm_seed_inventory', data: { item_name: 'Dell UltraSharp 27" Monitors', stock_qty: 45, cost_usd: 349.99, arrival_date: '2026-05-10', is_active: true }, createdAt: '2026-05-10T11:00:00Z', updatedAt: '2026-05-10T11:00:00Z' },
    { id: 'rec_102', modelId: 'm_seed_inventory', data: { item_name: 'Apple MacBook Pro M3 Max 16"', stock_qty: 12, cost_usd: 3499.00, arrival_date: '2026-05-12', is_active: true }, createdAt: '2026-05-12T10:30:00Z', updatedAt: '2026-05-12T10:30:00Z' },
    { id: 'rec_103', modelId: 'm_seed_inventory', data: { item_name: 'Herman Miller Aeron Chairs', stock_qty: 25, cost_usd: 1250.00, arrival_date: '2026-05-15', is_active: true }, createdAt: '2026-05-15T09:15:00Z', updatedAt: '2026-05-15T09:15:00Z' },
    { id: 'rec_104', modelId: 'm_seed_inventory', data: { item_name: 'Cisco Integrated PoE Switch', stock_qty: 5, cost_usd: 890.00, arrival_date: '2026-05-18', is_active: false }, createdAt: '2026-05-18T16:00:00Z', updatedAt: '2026-05-18T16:00:00Z' }
  ]
};

// Ensure database file exists
function loadDB(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn('Error reading db.json, falling back to seeds.', e);
  }
  // Write seeds if database loaded unsuccessfully
  fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATABASE, null, 2));
  return { ...INITIAL_DATABASE };
}

function saveDB(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('Error writing database to disk.', e);
  }
}

// Global DB instance
let DB = loadDB();

// Helper to log user activities
function addLog(username: string, action: string, entity: string, details: string, type: 'info' | 'warning' | 'danger' | 'success' = 'info', userId?: string, userEmail?: string, ipAddress: string = '127.0.0.1') {
  const newLog = {
    id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    userId,
    userEmail,
    username,
    action,
    entity,
    details,
    timestamp: new Date().toISOString(),
    ipAddress,
    type
  };
  DB.activityLogs.unshift(newLog);
  // Keep logs capped at 1000 for server memory
  if (DB.activityLogs.length > 1000) {
    DB.activityLogs = DB.activityLogs.slice(0, 1000);
  }
  saveDB(DB);
}

// Start simulation of activity logs/audits periodically to simulate real-world usage!
const mockActNames = ['admin', 'pm_john', 'pm_sarah', 'user_lucas', 'user_tadesse'];
const mockActions = [
  { action: 'session_keepalive', entity: 'session', details: 'User verified session heartbeat.', type: 'info' },
  { action: 'project_view', entity: 'project', details: 'Navigated to Project board analytics overview.', type: 'info' },
  { action: 'dashboard_refresh', entity: 'dashboard', details: 'Loaded active user project charts.', type: 'info' },
  { action: 'audit_review', entity: 'audit', details: 'Inspected activity log audit logs.', type: 'success' }
];

setInterval(() => {
  if (Math.random() > 0.4) {
    const actUser = mockActNames[Math.floor(Math.random() * mockActNames.length)];
    const act = mockActions[Math.floor(Math.random() * mockActions.length)];
    
    // Check user info from database
    const dbUser = DB.users.find(u => u.username === actUser);
    const userId = dbUser?.id;
    const userEmail = dbUser?.email;
    const ip = '192.168.1.' + Math.floor(Math.random() * 254 + 1);

    const logItem = {
      id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      userId,
      userEmail,
      username: actUser,
      action: act.action,
      entity: act.entity,
      details: act.details,
      timestamp: new Date().toISOString(),
      ipAddress: ip,
      type: act.type as any
    };

    DB.activityLogs.unshift(logItem);
    if (DB.activityLogs.length > 1000) {
      DB.activityLogs = DB.activityLogs.slice(0, 1000);
    }
    saveDB(DB);
  }
}, 30000); // add a mock activity log every 30 seconds in background

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Backend Session store (in production we cook with secure cookies/tokens, here we handle secure token)
  let activeAuthentications = new Map<string, any>();

  // --- Blade compilation engines ---
  function compileBladeString(content: string, data: Record<string, any> = {}): string {
    let result = content.replace(/\{\{\s*(.+?)\s*\}\}/g, (m, expr) => {
      let jsExpr = expr.trim();
      if (jsExpr.startsWith('$')) {
        jsExpr = jsExpr.substring(1);
      }
      try {
        const keys = Object.keys(data);
        const vals = Object.values(data);
        const fn = new Function(...keys, `return (${jsExpr});`);
        const val = fn(...vals);
        return val !== undefined && val !== null ? String(val) : '';
      } catch (e) {
        return '';
      }
    });
    return renderDirectives(result, data);
  }

  function compileBlade(templatePath: string, data: Record<string, any> = {}): string {
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }
    let content = fs.readFileSync(templatePath, 'utf-8');
    const extendsRegex = /@extends\s*\(\s*['"](.+?)['"]\s*\)/g;
    let layoutContent = '';
    const extendsMatch = extendsRegex.exec(content);
    if (extendsMatch) {
      const layoutPath = path.join(process.cwd(), 'resources', 'views', extendsMatch[1].replace(/\./g, '/') + '.blade.php');
      if (fs.existsSync(layoutPath)) {
        layoutContent = fs.readFileSync(layoutPath, 'utf-8');
      }
    }
    content = content.replace(extendsRegex, '');

    const sections: Record<string, string> = {};
    const sectionRegex = /@section\s*\(\s*['"](.+?)['"]\s*\)([\s\S]*?)@endsection/g;
    let match;
    while ((match = sectionRegex.exec(content)) !== null) {
      sections[match[1]] = match[2];
    }

    if (layoutContent) {
      let compiled = layoutContent;
      const yieldRegex = /@yield\s*\(\s*['"](.+?)['"]\s*\)/g;
      compiled = compiled.replace(yieldRegex, (m, sectionName) => {
        return sections[sectionName] !== undefined ? sections[sectionName] : '';
      });
      content = compiled;
    }

    const includeRegex = /@include\s*\(\s*['"](.+?)['"]\s*(?:,\s*(\{[\s\S]*?\}))?\s*\)/g;
    content = content.replace(includeRegex, (m, partialName, localContextStr) => {
      const partialPath = path.join(process.cwd(), 'resources', 'views', partialName.replace(/\./g, '/') + '.blade.php');
      if (fs.existsSync(partialPath)) {
        let localData = { ...data };
        if (localContextStr) {
          try {
            const parsed = new Function(`return ${localContextStr}`)();
            localData = { ...localData, ...parsed };
          } catch (e) {}
        }
        return compileBlade(partialPath, localData);
      }
      return `<!-- Partial ${partialName} not found -->`;
    });

    return compileBladeString(content, data);
  }

  function renderDirectives(content: string, data: Record<string, any>): string {
    const keys = Object.keys(data);
    const vals = Object.values(data);
    const evalExpr = (expr: string): any => {
      let jsExpr = expr.trim();
      jsExpr = jsExpr.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, '$1');
      try {
        const fn = new Function(...keys, `return (${jsExpr});`);
        return fn(...vals);
      } catch(e) {
        return false;
      }
    };

    const lines = content.split('\n');
    const output: string[] = [];
    let blockStack: any[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith('@if')) {
        const condMatch = trimmed.match(/@if\s*\((.+)\)/);
        const cond = condMatch ? condMatch[1] : 'false';
        const isTrue = evalExpr(cond);
        blockStack.push({ type: 'if', active: !!isTrue, hasRun: !!isTrue, lines: [] });
        continue;
      } else if (trimmed.startsWith('@elseif')) {
        const parent = blockStack[blockStack.length - 1];
        if (parent && parent.type === 'if') {
          if (!parent.hasRun) {
            const condMatch = trimmed.match(/@elseif\s*\((.+)\)/);
            const cond = condMatch ? condMatch[1] : 'false';
            const isTrue = evalExpr(cond);
            parent.active = !!isTrue;
            if (isTrue) parent.hasRun = true;
          } else {
            parent.active = false;
          }
        }
        continue;
      } else if (trimmed === '@else') {
        const parent = blockStack[blockStack.length - 1];
        if (parent && parent.type === 'if') {
          parent.active = !parent.hasRun;
          parent.hasRun = true;
        }
        continue;
      } else if (trimmed === '@endif') {
        blockStack.pop();
        continue;
      } else if (trimmed.startsWith('@foreach')) {
        const loopMatch = trimmed.match(/@foreach\s*\((.+)\s+as\s+(.+)\)/);
        blockStack.push({ type: 'foreach', active: true, hasRun: true, lines: [], loopExpr: loopMatch ? loopMatch[1] + ' as ' + loopMatch[2] : undefined });
        continue;
      } else if (trimmed === '@endforeach') {
        const block = blockStack.pop();
        if (block && block.type === 'foreach' && block.loopExpr) {
          const divider = block.loopExpr.split(' as ');
          const collectionExpr = divider[0].trim();
          const loopVars = divider[1].trim();
          const collection = evalExpr(collectionExpr) || [];

          let keyVar: string | null = null;
          let valVar: string = loopVars;

          if (loopVars.includes('=>')) {
            const parts = loopVars.split('=>');
            keyVar = parts[0].trim().replace(/^\$/, '');
            valVar = parts[1].trim().replace(/^\$/, '');
          } else {
            valVar = loopVars.replace(/^\$/, '');
          }

          if (Array.isArray(collection)) {
            collection.forEach((item, index) => {
              const loopData = { ...data };
              if (keyVar) loopData[keyVar] = index;
              loopData[valVar] = item;
              const blockContent = block.lines.join('\n');
              output.push(compileBladeString(blockContent, loopData));
            });
          } else if (collection && typeof collection === 'object') {
            Object.entries(collection).forEach(([key, val]) => {
              const loopData = { ...data };
              if (keyVar) loopData[keyVar] = key;
              loopData[valVar] = val;
              const blockContent = block.lines.join('\n');
              output.push(compileBladeString(blockContent, { ...loopData, item: val }));
            });
          }
        }
        continue;
      }

      if (blockStack.length > 0) {
        const currentBlock = blockStack[blockStack.length - 1];
        if (currentBlock.type === 'foreach') {
          currentBlock.lines.push(line);
        } else if (currentBlock.type === 'if') {
          if (blockStack.every(b => b.active)) {
            output.push(line);
          }
        }
      } else {
        output.push(line);
      }
    }
    return output.join('\n');
  }

  // --- Html Auth Checks ---
  function getUserFromCookie(req: express.Request): any {
    const cookies = req.headers.cookie;
    if (!cookies) return null;
    const match = cookies.match(/admin_session=([^;]+)/);
    if (!match) return null;
    const token = match[1];
    return activeAuthentications.get(token) || null;
  }

  const requireHtmlAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const session = getUserFromCookie(req);
    if (!session) {
      return res.redirect('/login');
    }
    req.user = session.user;
    next();
  };

  const redirectIfAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const session = getUserFromCookie(req);
    if (session) {
      return res.redirect('/dashboard');
    }
    next();
  };

  // --- API ROUTES ---

  // Auth: Login taking username and password
  app.post('/api/auth/login', (req, res) => {
    const { username, password, rememberMe } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Default password verified is '12345678'
    if (password !== '12345678') {
      return res.status(401).json({ error: 'Invalid password. Check seed configuration' });
    }

    const user = DB.users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'User is suspended' });
    }

    // Create session token
    const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    const userSession = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        departmentId: user.departmentId,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      rememberMe: !!rememberMe
    };

    activeAuthentications.set(token, userSession);

    // Create a real session record for Yajra audit
    const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '192.168.1.1';
    const cleanIp = ip.includes('::') ? '127.0.0.1' : ip;
    const userAgentStr = req.headers['user-agent'] || 'Mozilla Explorer';

    const newSess = {
      id: 'sess_' + Date.now(),
      userId: user.id,
      username: user.username,
      name: user.name,
      ipAddress: cleanIp,
      userAgent: userAgentStr,
      loginTime: new Date().toISOString(),
      isCurrent: true
    };
    
    // Add to sessions list
    DB.sessions.push(newSess);
    
    // Create activity logs audit for successful sign in
    addLog(user.username, 'user_login', 'auth', `User logged in using password successfully (${rememberMe ? 'remember me active' : 'session-only'}).`, 'success', user.id, user.email, cleanIp);

    // Set authentication cookie for Blade templates
    const maxAge = rememberMe ? 60*60*24*30 : 60*60*24; // 30 days or 1 day
    res.setHeader('Set-Cookie', `admin_session=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`);

    return res.json({ token, user, sessionId: newSess.id });
  });

  // Auth: Email recovery taking email address
  app.post('/api/auth/recover', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = DB.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: 'No user registered with this email address' });
    }

    // Load recovery template
    const template = DB.emailTemplates.find(t => t.id === 'temp_forgot');
    if (!template) {
      return res.status(500).json({ error: 'Recovery template not configured' });
    }

    const ip = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '192.168.1.1';
    const cleanIp = ip.includes('::') ? '127.0.0.1' : ip;

    // Process mail body with variables dynamic substitution
    let processedBody = template.body
      .replace(/{{name}}/g, user.name)
      .replace(/{{username}}/g, user.username)
      .replace(/{{recovery_link}}/g, `https://enterprise-panel-recovery.io/reset-password?token=rec_token_71829e0a2f`)
      .replace(/{{ip_address}}/g, cleanIp);

    let processedSubject = template.subject.replace(/{{username}}/g, user.username);

    addLog(user.username, 'password_recovery_requested', 'auth', `Password recovery link requested for ${email}`, 'warning', user.id, user.email, cleanIp);

    // Return the response containing details of the recovery email sent to let the user debug template modification!
    return res.json({
      success: true,
      message: 'Password reset link has been compiled and emailed successfully.',
      emitted_envelope: {
        to: email,
        subject: processedSubject,
        body: processedBody,
        renderedAt: new Date().toISOString()
      }
    });
  });

  // Global Auth Middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization;
    if (!token || !activeAuthentications.has(token)) {
      return res.status(401).json({ error: 'Unauthorized credentials. Please sign in' });
    }
    req.user = activeAuthentications.get(token).user;
    next();
  };

  // Auth current verification
  app.get('/api/auth/verify', (req, res) => {
    const token = req.headers.authorization;
    if (!token || !activeAuthentications.has(token)) {
      return res.status(401).json({ error: 'Auth expired' });
    }
    return res.json(activeAuthentications.get(token));
  });

  // Get metadata system list (Role counts, Projects, logs etc)
  app.get('/api/sys/stats', requireAuth, (req, res) => {
    return res.json({
      dbSize: DB_FILE ? fs.statSync(DB_FILE).size : 0,
      userCount: DB.users.length,
      deptCount: DB.departments.length,
      projectCount: DB.projects.length,
      activeSessions: DB.sessions.length,
      customCrudCount: DB.generatedModels.length,
      logsCount: DB.activityLogs.length
    });
  });

  // Handle users management (CRUD users)
  app.get('/api/users', requireAuth, (req, res) => {
    const result = DB.users.map(u => {
      const uRole = DB.roles.find(r => r.id === u.roleId);
      const uDept = DB.departments.find(d => d.id === u.departmentId);
      return { ...u, roleName: uRole?.name || 'Unknown', departmentName: uDept?.name || 'Unassigned' };
    });
    return res.json(result);
  });

  app.post('/api/users', requireAuth, (req, res) => {
    const { username, email, name, roleId, departmentId } = req.body;
    if (!username || !email || !name || !roleId) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (DB.users.some(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const newUser = {
      id: 'u_' + Date.now(),
      username,
      email,
      name,
      roleId,
      departmentId: departmentId || undefined,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    DB.users.push(newUser);
    saveDB(DB);

    addLog(req.user?.username || 'system', 'user_creation', 'user', `Created user ${newUser.name} with role ${roleId}`, 'success');
    return res.status(201).json(newUser);
  });

  app.put('/api/users/:userId', requireAuth, (req, res) => {
    const { userId } = req.params;
    const { email, name, roleId, departmentId, isActive } = req.body;
    
    const userIndex = DB.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

    DB.users[userIndex] = {
      ...DB.users[userIndex],
      email: email || DB.users[userIndex].email,
      name: name || DB.users[userIndex].name,
      roleId: roleId || DB.users[userIndex].roleId,
      departmentId: departmentId !== undefined ? departmentId : DB.users[userIndex].departmentId,
      isActive: isActive !== undefined ? isActive : DB.users[userIndex].isActive
    };

    saveDB(DB);
    addLog(req.user?.username || 'system', 'user_update', 'user', `Updated user metadata for ${DB.users[userIndex].name}`, 'info');
    return res.json(DB.users[userIndex]);
  });

  app.delete('/api/users/:userId', requireAuth, (req, res) => {
    const { userId } = req.params;
    const u = DB.users.find(u => u.id === userId);
    if (!u) return res.status(404).json({ error: 'User not found' });

    DB.users = DB.users.filter(user => user.id !== userId);
    saveDB(DB);

    addLog(req.user?.username || 'system', 'user_deletion', 'user', `Deleted user account: ${u.name}`, 'danger');
    return res.json({ success: true });
  });

  // Roles & Permissions management
  app.get('/api/roles', requireAuth, (req, res) => {
    return res.json(DB.roles);
  });

  app.put('/api/roles/:roleId', requireAuth, (req, res) => {
    const { roleId } = req.params;
    const { name, description, permissions } = req.body;

    const roleIndex = DB.roles.findIndex(r => r.id === roleId);
    if (roleIndex === -1) return res.status(404).json({ error: 'Role not found' });

    DB.roles[roleIndex] = {
      ...DB.roles[roleIndex],
      name: name || DB.roles[roleIndex].name,
      description: description || DB.roles[roleIndex].description,
      permissions: permissions || DB.roles[roleIndex].permissions
    };

    saveDB(DB);
    addLog(req.user?.username || 'system', 'role_update', 'role', `Updated role permissions for role: ${DB.roles[roleIndex].name}`, 'info');
    return res.json(DB.roles[roleIndex]);
  });

  // Yajra Server-Side Datatables Sessions API
  // Requests: draw, start, length, search[value], order[0][column], order[0][dir], etc.
  app.post('/api/datatables/sessions', requireAuth, (req, res) => {
    const { draw = 1, start = 0, length = 10, search = { value: '' }, order = [] } = req.body;

    // Get list of standard session records
    let result = DB.sessions.map(s => {
      const user = DB.users.find(u => u.id === s.userId);
      return {
        ...s,
        username: user?.username || s.username || 'unknown',
        email: user?.email || 'N/A'
      };
    });

    const recordsTotal = result.length;

    // Apply Real-time Searching filter
    const searchValue = (search.value || '').toLowerCase().trim();
    if (searchValue) {
      result = result.filter(s => 
        s.username.toLowerCase().includes(searchValue) ||
        s.name.toLowerCase().includes(searchValue) ||
        s.ipAddress.toLowerCase().includes(searchValue) ||
        s.userAgent.toLowerCase().includes(searchValue) ||
        s.email.toLowerCase().includes(searchValue)
      );
    }

    const recordsFiltered = result.length;

    // Sorting implementation
    if (order && order.length > 0) {
      const colIndex = order[0].column;
      const colDir = order[0].dir; // 'asc' or 'desc'
      const columns = ['name', 'ipAddress', 'userAgent', 'loginTime'];
      const targetCol = columns[colIndex] || 'loginTime';

      result.sort((a: any, b: any) => {
        let valA = a[targetCol] || '';
        let valB = b[targetCol] || '';
        if (typeof valA === 'string') {
          return colDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return colDir === 'asc' ? valA - valB : valB - valA;
      });
    } else {
      // Default latest session on top
      result.sort((a, b) => b.loginTime.localeCompare(a.loginTime));
    }

    // Paginating
    const pSlice = result.slice(parseInt(start), parseInt(start) + parseInt(length));

    // Response following strictly Yajra custom protocol standard
    return res.json({
      draw: parseInt(draw),
      recordsTotal,
      recordsFiltered,
      data: pSlice
    });
  });

  // Terminate Yajra Session
  app.delete('/api/sessions/:sessionId', requireAuth, (req, res) => {
    const { sessionId } = req.params;
    const session = DB.sessions.find(s => s.id === sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    DB.sessions = DB.sessions.filter(s => s.id !== sessionId);
    saveDB(DB);

    addLog(req.user?.username || 'system', 'session_terminated', 'session', `Terminated active web session for ${session.name} associated with IP: ${session.ipAddress}`, 'warning');
    return res.json({ success: true });
  });

  // Yajra Server-Side Datatables Audit/Activity Logs API
  app.post('/api/datatables/logs', requireAuth, (req, res) => {
    const { draw = 1, start = 0, length = 10, search = { value: '' }, order = [] } = req.body;

    let result = [...DB.activityLogs];
    const recordsTotal = result.length;

    const searchValue = (search.value || '').toLowerCase().trim();
    if (searchValue) {
      result = result.filter(log => 
        log.username.toLowerCase().includes(searchValue) ||
        (log.userEmail && log.userEmail.toLowerCase().includes(searchValue)) ||
        log.action.toLowerCase().includes(searchValue) ||
        log.entity.toLowerCase().includes(searchValue) ||
        log.details.toLowerCase().includes(searchValue) ||
        log.ipAddress.toLowerCase().includes(searchValue)
      );
    }

    const recordsFiltered = result.length;

    // Dynamic Server-Side Sort
    if (order && order.length > 0) {
      const colIndex = order[0].column;
      const colDir = order[0].dir;
      const columns = ['timestamp', 'username', 'action', 'entity', 'details', 'ipAddress'];
      const targetCol = columns[colIndex] || 'timestamp';

      result.sort((a: any, b: any) => {
        let valA = a[targetCol] || '';
        let valB = b[targetCol] || '';
        if (typeof valA === 'string') {
          return colDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return colDir === 'asc' ? valA - valB : valB - valA;
      });
    } else {
      // Default sort chronological-latest first
      result.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    }

    const pSlice = result.slice(parseInt(start), parseInt(start) + parseInt(length));

    return res.json({
      draw: parseInt(draw),
      recordsTotal,
      recordsFiltered,
      data: pSlice
    });
  });

  // Dynamic Email Settings template updates
  app.get('/api/email-templates', requireAuth, (req, res) => {
    return res.json(DB.emailTemplates);
  });

  app.put('/api/email-templates/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    const { subject, body } = req.body;

    const index = DB.emailTemplates.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: 'Template not found' });

    DB.emailTemplates[index] = {
      ...DB.emailTemplates[index],
      subject: subject || DB.emailTemplates[index].subject,
      body: body || DB.emailTemplates[index].body,
      updatedAt: new Date().toISOString()
    };

    saveDB(DB);
    addLog(req.user?.username || 'system', 'template_update', 'settings', `Modified dynamic email template: ${DB.emailTemplates[index].name}`, 'success');
    return res.json(DB.emailTemplates[index]);
  });

  // Departments and Projects APIs
  app.get('/api/departments', requireAuth, (req, res) => {
    return res.json(DB.departments);
  });

  app.post('/api/departments', requireAuth, (req, res) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Department Name is required' });

    const newDept = {
      id: 'dept_' + Date.now(),
      name,
      description: description || '',
      createdAt: new Date().toISOString()
    };

    DB.departments.push(newDept);
    saveDB(DB);

    addLog(req.user?.username || 'system', 'department_create', 'department', `Created division / department: ${name}`, 'success');
    return res.status(201).json(newDept);
  });

  // Projects management under each department
  app.get('/api/projects', requireAuth, (req, res) => {
    const result = DB.projects.map(p => {
      const pmUser = DB.users.find(u => u.id === p.managerId);
      const members = DB.users.filter(u => p.memberIds.includes(u.id));
      const dept = DB.departments.find(d => d.id === p.departmentId);

      return {
        ...p,
        departmentName: dept?.name || 'Unassigned',
        managerName: pmUser?.name || 'No Project Manager Assigned',
        managerEmail: pmUser?.email,
        membersList: members.map(m => ({ id: m.id, name: m.name, email: m.email }))
      };
    });
    return res.json(result);
  });

  app.post('/api/projects', requireAuth, (req, res) => {
    const { name, description, departmentId, managerId, memberIds = [], status = 'planning' } = req.body;
    if (!name || !departmentId) {
      return res.status(400).json({ error: 'Project name and department ID are required.' });
    }

    const newProject = {
      id: 'p_' + Date.now(),
      name,
      description: description || '',
      departmentId,
      managerId: managerId || undefined, // strictly max one project manager allowed
      memberIds: memberIds || [],
      status: status || 'planning',
      createdAt: new Date().toISOString()
    };

    DB.projects.push(newProject);
    saveDB(DB);

    const dept = DB.departments.find(d => d.id === departmentId);
    let alertLog = `Created project: "${name}" under department: "${dept?.name || 'unknown'}"`;
    
    // Auto-alert and trigger PM Assignment email template simulation if manager ID is set
    if (managerId) {
      const pm = DB.users.find(u => u.id === managerId);
      if (pm) {
        alertLog += ` with assigned PM: ${pm.name}`;
      }
    }

    addLog(req.user?.username || 'system', 'project_create', 'project', alertLog, 'success');
    return res.status(201).json(newProject);
  });

  // Update projects (assign project manager, modify members, modify status)
  app.put('/api/projects/:projectId', requireAuth, (req, res) => {
    const { projectId } = req.params;
    const { name, description, departmentId, managerId, memberIds, status } = req.body;

    const idx = DB.projects.findIndex(p => p.id === projectId);
    if (idx === -1) return res.status(404).json({ error: 'Project not found' });

    const prevManagerId = DB.projects[idx].managerId;

    DB.projects[idx] = {
      ...DB.projects[idx],
      name: name || DB.projects[idx].name,
      description: description !== undefined ? description : DB.projects[idx].description,
      departmentId: departmentId || DB.projects[idx].departmentId,
      managerId: managerId !== undefined ? (managerId || undefined) : DB.projects[idx].managerId, // strictly exactly ONE project manager allowed
      memberIds: memberIds || DB.projects[idx].memberIds,
      status: status || DB.projects[idx].status
    };

    saveDB(DB);

    const pmMsg = DB.projects[idx].managerId 
      ? `PM assigned: ${DB.users.find(u => u.id === DB.projects[idx].managerId)?.name || 'unassigned'}`
      : 'No Assigned PM';

    addLog(req.user?.username || 'system', 'project_update', 'project', `Modified project attributes for "${DB.projects[idx].name}". Status: ${DB.projects[idx].status.toUpperCase()}. ${pmMsg}. Total Members: ${DB.projects[idx].memberIds.length}`, 'info');

    // Simulate sending email if manager assigned changed
    if (managerId && managerId !== prevManagerId) {
      const pmUser = DB.users.find(u => u.id === managerId);
      const pmTemplate = DB.emailTemplates.find(t => t.id === 'temp_pm_assigned');
      const dept = DB.departments.find(d => d.id === DB.projects[idx].departmentId);

      if (pmUser && pmTemplate) {
        const mailBody = pmTemplate.body
          .replace(/{{name}}/g, pmUser.name)
          .replace(/{{project_name}}/g, DB.projects[idx].name)
          .replace(/{{department_name}}/g, dept?.name || 'Department')
          .replace(/{{project_desc}}/g, DB.projects[idx].description)
          .replace(/{{launch_date}}/g, new Date(Date.now() + 1000 * 3600 * 24 * 14).toLocaleDateString()); // 2 weeks out
        
        console.log(`[EMAIL DISPATCH SIMULATOR] to PM ${pmUser.email}: `, mailBody);
      }
    }

    return res.json(DB.projects[idx]);
  });

  // Delete project
  app.delete('/api/projects/:projectId', requireAuth, (req, res) => {
    const { projectId } = req.params;
    const p = DB.projects.find(p => p.id === projectId);
    if (!p) return res.status(404).json({ error: 'Project not found' });

    DB.projects = DB.projects.filter(proj => proj.id !== projectId);
    saveDB(DB);

    addLog(req.user?.username || 'system', 'project_deletion', 'project', `Scrapped project: ${p.name}`, 'danger');
    return res.json({ success: true });
  });

  // --- INTERACTIVE CRUD GENERATOR API ---
  // Generates Model, Dynamic controller logic, custom route binding, React code and migration schema!
  // Stores schema dynamically in DB, immediately populating the live sidebar lists!
  app.post('/api/crud-generator/generate', requireAuth, (req, res) => {
    const { name, label, fields } = req.body;
    if (!name || !fields || fields.length === 0) {
      return res.status(400).json({ error: 'Model name and fields array are required.' });
    }

    const cleanModelName = name.replace(/[^a-zA-Z0-9]/g, '');
    const modelPlural = (cleanModelName + 's').toLowerCase();
    const modelId = 'm_' + cleanModelName.toLowerCase() + '_' + Date.now();

    // Generate Controller CJS Code Block Representing Laravel 10 scaffolding
    const controllerCode = `<?php\n\nnamespace App\\Http\\Controllers;\n\nuse App\\Models\\${cleanModelName};\nuse Illuminate\\Http\\Request;\nuse Yajra\\DataTables\\DataTables;\n\nclass ${cleanModelName}Controller extends Controller\n{\n    public function index(Request $request)\n    {\n        if ($request->ajax()) {\n            $data = ${cleanModelName}::latest()->get();\n            return DataTables::of($data)\n                ->addIndexColumn()\n                ->addColumn('action', function($row){\n                    return '<button class=\"edit btn btn-primary btn-sm\">Edit</button>';\n                })\n                ->rawColumns(['action'])\n                ->make(true);\n        }\n        return view('${modelPlural}.index');\n    }\n}`;

    // Model Content code representing Laravel Model
    const modelCode = `<?php\n\nnamespace App\\Models;\n\nuse Illuminate\\Database\\Eloquent\\Factories\\HasFactory;\nuse Illuminate\\Database\\Eloquent\\Model;\n\nclass ${cleanModelName} extends Model\n{\n    use HasFactory;\n\n    protected $table = '${modelPlural}';\n\n    protected $fillable = [\n        ${fields.map((f: any) => `'${f.name}'`).join(',\n        ')}\n    ];\n}`;

    // Migrations Code representing Laravel Blueprint
    const migrationCode = `<?php\n\nuse Illuminate\\Database\\Migrations\\Migration;\nuse Illuminate\\Database\\Schema\\Blueprint;\nuse Illuminate\\Support\\Facades\\Schema;\n\nreturn new class extends Migration\n{\n    public function up(): void\n    {\n        Schema::create('${modelPlural}', function (Blueprint $table) {\n            $table->id();\n            ${fields.map((f: any) => {
      let tStr = '';
      if (f.type === 'number') tStr = `$table->integer('${f.name}')`;
      else if (f.type === 'date') tStr = `$table->date('${f.name}')`;
      else if (f.type === 'boolean') tStr = `$table->boolean('${f.name}')->default(true)`;
      else tStr = `$table->string('${f.name}')`;
      return tStr + (f.required ? '' : '->nullable()') + ';';
    }).join('\n            ')}\n            $table->timestamps();\n        });\n    }\n};`;

    // View Scaffold (Blade PHP File layout with Tailwind + Table elements)
    const viewCode = `@extends('layouts.app')\n\n@section('content')\n<div class="card card-outline card-primary">\n    <div class="card-header">\n        <h3 class="card-title">Manage ${label || cleanModelName}</h3>\n    </div>\n    <div class="card-body">\n        <table class="table table-bordered dynamic-yajra-table">\n            <thead>\n                <tr>\n                    ${fields.map((f: any) => `<th>${f.label}</th>`).join('\n                    ')}\n                </tr>\n            </thead>\n        </table>\n    </div>\n</div>\n@endsection`;

    // Route config
    const routeCode = `Route::resource('${modelPlural}', ${cleanModelName}Controller::class);`;

    const generatedModel = {
      id: modelId,
      name: cleanModelName,
      p_plural: modelPlural,
      label: label || cleanModelName,
      fields,
      createdAt: new Date().toISOString(),
      controllerCode,
      modelCode,
      viewCode,
      routeCode,
      migrationCode
    };

    DB.generatedModels.push(generatedModel);
    saveDB(DB);

    addLog(req.user?.username || 'system', 'crud_scaffolded', 'system', `Generated CRUD Scaffold for "${cleanModelName}" with ${fields.length} database properties. Live dynamic endpoints binded immediately.`, 'success');

    // Trigger Dynamic system alerts about CRUD generation using template
    const template = DB.emailTemplates.find(t => t.id === 'temp_crud_created');
    if (template) {
      const placeholderFields = fields.map((f: any) => `${f.name} (${f.type})`).join(', ');
      const subject = template.subject.replace(/{{model_name}}/g, cleanModelName);
      const body = template.body
        .replace(/{{model_name}}/g, cleanModelName)
        .replace(/{{fields_list}}/g, placeholderFields);
      
      console.log(`[ALERT ALERT] Admin email compiled:\nSubject: ${subject}\nBody: ${body}`);
    }

    return res.status(201).json(generatedModel);
  });

  // Fetch all Scaffolds in system
  app.get('/api/crud-generator/models', requireAuth, (req, res) => {
    return res.json(DB.generatedModels);
  });

  // Dynamic endpoints for scaffolded CRUD records
  app.get('/api/crud-generator/records/:modelId', requireAuth, (req, res) => {
    const { modelId } = req.params;
    const records = DB.dynamicRecords.filter(r => r.modelId === modelId);
    return res.json(records);
  });

  app.post('/api/crud-generator/records/:modelId', requireAuth, (req, res) => {
    const { modelId } = req.params;
    const model = DB.generatedModels.find(m => m.id === modelId);
    if (!model) return res.status(404).json({ error: 'Model template not found' });

    // Build the dynamic data object from body matching fields schema
    const recordData: Record<string, any> = {};
    for (const f of model.fields) {
      let val = req.body[f.name];
      if (f.required && (val === undefined || val === '')) {
        return res.status(400).json({ error: `Field '${f.name}' (${f.label}) is required.` });
      }
      
      // Cast values safely
      if (f.type === 'number') {
        recordData[f.name] = Number(val);
      } else if (f.type === 'boolean') {
        recordData[f.name] = val === true || val === 'true' || val === 1 || val === '1';
      } else {
        recordData[f.name] = val || '';
      }
    }

    const newRecord = {
      id: 'rec_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      modelId,
      data: recordData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    DB.dynamicRecords.push(newRecord);
    saveDB(DB);

    addLog(req.user?.username || 'system', 'crud_record_create', model.name, `Created database record in "${model.name}": ${JSON.stringify(recordData)}`, 'success');
    return res.status(201).json(newRecord);
  });

  app.put('/api/crud-generator/records/:modelId/:recordId', requireAuth, (req, res) => {
    const { modelId, recordId } = req.params;
    const model = DB.generatedModels.find(m => m.id === modelId);
    if (!model) return res.status(404).json({ error: 'Model template not found' });

    const idx = DB.dynamicRecords.findIndex(r => r.id === recordId && r.modelId === modelId);
    if (idx === -1) return res.status(404).json({ error: 'Record not found' });

    // Update dynamic fields
    const recordData = { ...DB.dynamicRecords[idx].data };
    for (const f of model.fields) {
      if (req.body[f.name] !== undefined) {
        let val = req.body[f.name];
        if (f.type === 'number') {
          recordData[f.name] = Number(val);
        } else if (f.type === 'boolean') {
          recordData[f.name] = val === true || val === 'true' || val === 1 || val === '1';
        } else {
          recordData[f.name] = val;
        }
      }
    }

    DB.dynamicRecords[idx] = {
      ...DB.dynamicRecords[idx],
      data: recordData,
      updatedAt: new Date().toISOString()
    };

    saveDB(DB);
    addLog(req.user?.username || 'system', 'crud_record_update', model.name, `Updated database record in "${model.name}" to: ${JSON.stringify(recordData)}`, 'info');
    return res.json(DB.dynamicRecords[idx]);
  });

  app.delete('/api/crud-generator/records/:modelId/:recordId', requireAuth, (req, res) => {
    const { modelId, recordId } = req.params;
    const model = DB.generatedModels.find(m => m.id === modelId);
    
    const record = DB.dynamicRecords.find(r => r.id === recordId && r.modelId === modelId);
    if (!record) return res.status(404).json({ error: 'Record not found' });

    DB.dynamicRecords = DB.dynamicRecords.filter(r => !(r.id === recordId && r.modelId === modelId));
    saveDB(DB);

    addLog(req.user?.username || 'system', 'crud_record_delete', model?.name || 'custom_model', `Soft purged record from "${model?.name || 'custom_model'}": ID: ${recordId}`, 'danger');
    return res.json({ success: true });
  });

  // Delete generated dynamic CRUD scaffold itself
  app.delete('/api/crud-generator/models/:modelId', requireAuth, (req, res) => {
    const { modelId } = req.params;
    const model = DB.generatedModels.find(m => m.id === modelId);
    if (!model) return res.status(404).json({ error: 'Model template not found' });

    // Remove model schemas, generated dynamic tables, and its corresponding dynamicRecords
    DB.generatedModels = DB.generatedModels.filter(m => m.id !== modelId);
    DB.dynamicRecords = DB.dynamicRecords.filter(r => r.modelId !== modelId);
    saveDB(DB);

    addLog(req.user?.username || 'system', 'crud_purge', 'system', `Scrapped model scaffolding schema for "${model.name}". Cleared matching records.`, 'danger');
    return res.json({ success: true });
  });


  // --- HTML PAGE RENDERING ROUTES (LARAVEL BLADE CONTROLLER SHIM INTERCEPTORS) ---
  function getSharedBladeData(req: express.Request, currentTab: string): any {
    const current_user = req.user;
    const userRole = DB.roles.find(r => r.id === current_user.roleId);
    return {
      current_user,
      user_role_name: userRole?.name || 'Operator',
      current_tab: currentTab,
      sidebar_crud_models: DB.generatedModels,
      stats: {
        dbSize: DB_FILE ? fs.statSync(DB_FILE).size : 0,
        userCount: DB.users.length,
        deptCount: DB.departments.length,
        projectCount: DB.projects.length,
        activeSessions: DB.sessions.length,
        customCrudCount: DB.generatedModels.length,
        logsCount: DB.activityLogs.length
      }
    };
  }

  app.get('/', (req, res) => {
    const session = getUserFromCookie(req);
    if (session) {
      return res.redirect('/dashboard');
    }
    return res.redirect('/login');
  });

  app.get('/login', redirectIfAuthenticated, (req, res) => {
    const viewPath = path.join(process.cwd(), 'resources', 'views', 'login.blade.php');
    const html = compileBlade(viewPath, {});
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  });

  app.get('/logout', (req, res) => {
    res.setHeader('Set-Cookie', 'admin_session=; Path=/; Max-Age=0; SameSite=Lax');
    return res.redirect('/login');
  });

  app.get('/dashboard', requireHtmlAuth, (req, res) => {
    const viewPath = path.join(process.cwd(), 'resources', 'views', 'dashboard.blade.php');
    const html = compileBlade(viewPath, getSharedBladeData(req, 'dashboard'));
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  });

  app.get('/users', requireHtmlAuth, (req, res) => {
    const viewPath = path.join(process.cwd(), 'resources', 'views', 'users.blade.php');
    const html = compileBlade(viewPath, getSharedBladeData(req, 'users'));
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  });

  app.get('/roles', requireHtmlAuth, (req, res) => {
    const viewPath = path.join(process.cwd(), 'resources', 'views', 'roles.blade.php');
    const html = compileBlade(viewPath, getSharedBladeData(req, 'roles'));
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  });

  app.get('/departments-projects', requireHtmlAuth, (req, res) => {
    const viewPath = path.join(process.cwd(), 'resources', 'views', 'projects.blade.php');
    const html = compileBlade(viewPath, getSharedBladeData(req, 'projects'));
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  });

  app.get('/sessions', requireHtmlAuth, (req, res) => {
    const viewPath = path.join(process.cwd(), 'resources', 'views', 'sessions.blade.php');
    const html = compileBlade(viewPath, getSharedBladeData(req, 'sessions'));
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  });

  app.get('/audits', requireHtmlAuth, (req, res) => {
    const viewPath = path.join(process.cwd(), 'resources', 'views', 'audits.blade.php');
    const html = compileBlade(viewPath, getSharedBladeData(req, 'audits'));
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  });

  app.get('/email-templates', requireHtmlAuth, (req, res) => {
    const viewPath = path.join(process.cwd(), 'resources', 'views', 'email-templates.blade.php');
    const html = compileBlade(viewPath, getSharedBladeData(req, 'email-templates'));
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  });

  app.get('/crud-generator', requireHtmlAuth, (req, res) => {
    const viewPath = path.join(process.cwd(), 'resources', 'views', 'crud-generator.blade.php');
    const html = compileBlade(viewPath, getSharedBladeData(req, 'crud-generator'));
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  });

  app.get('/crud/:modelPlural', requireHtmlAuth, (req, res) => {
    const { modelPlural } = req.params;
    const model = DB.generatedModels.find(m => m.plural.toLowerCase() === modelPlural.toLowerCase());
    if(!model) {
      return res.status(404).send('Custom Scaffolding Model not found.');
    }
    const viewPath = path.join(process.cwd(), 'resources', 'views', 'dynamic-crud.blade.php');
    const data = {
      ...getSharedBladeData(req, 'custom_crud'),
      selected_model: model
    };
    const html = compileBlade(viewPath, data);
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  });


  // Serve client bundle inside sandboxed Cloud Run env
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA Fallback for matching route navigation paths safely
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ENTERPRISE PORTAL DAEMON] Live and operational on port ${PORT}`);
  });
}

startServer();
