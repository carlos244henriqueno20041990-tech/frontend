import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownLeft, ArrowRight, ArrowUpRight, Boxes, BriefcaseBusiness,
  Check, ChevronDown, ChevronRight, CircleAlert, Download, Ellipsis, Eye, EyeOff,
  Filter, LayoutDashboard, LockKeyhole, LogOut, Menu, Package, Pencil, Plus, Search,
  ShieldCheck,
  ShoppingBag, ShoppingCart, SlidersHorizontal, Sparkles, Store, Trash2, Truck,
  UserRound, Users, X
} from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://carloshenriquenogueira.alwaysdata.net/api')).replace(/\/+$/, '');
const sessionKey = 'vertice-user';

function getAccessToken() {
  try {
    return JSON.parse(sessionStorage.getItem(sessionKey))?.token || null;
  } catch {
    return null;
  }
}

const resources = [
  {
    key: 'produtos', title: 'Produtos', singular: 'produto', endpoint: '/produtos',
    idField: 'id_produto', icon: Package, group: 'Catálogo',
    fields: [
      { name: 'nome', label: 'Nome do produto', required: true },
      { name: 'descricao', label: 'Descrição', required: true },
      { name: 'preco', label: 'Preço', type: 'number', min: '0.01', step: '0.01', required: true },
      { name: 'imagem_produto', label: 'URL da imagem', required: true }
    ],
    columns: ['nome', 'descricao', 'preco']
  },
  {
    key: 'clientes', title: 'Clientes', singular: 'cliente', endpoint: '/clientes',
    idField: 'id_cliente', icon: Users, group: 'Relacionamento',
    fields: [
      { name: 'nome', label: 'Nome completo', required: true },
      { name: 'email', label: 'E-mail', type: 'email', required: true },
      { name: 'contato', label: 'Telefone / contato' },
      { name: 'ativo', label: 'Situação', type: 'select', options: [['1', 'Ativo'], ['0', 'Inativo']] }
    ],
    columns: ['nome', 'email', 'contato', 'ativo']
  },
  {
    key: 'fornecedores', title: 'Fornecedores', singular: 'fornecedor', endpoint: '/fornecedores',
    idField: 'id_fornecedor', icon: Truck, group: 'Relacionamento',
    fields: [
      { name: 'nome', label: 'Nome do contato', required: true },
      { name: 'empresa', label: 'Empresa' },
      { name: 'email', label: 'E-mail', type: 'email' },
      { name: 'telefone', label: 'Telefone' },
      { name: 'cidade', label: 'Cidade' },
      { name: 'estado', label: 'UF' },
      { name: 'ativo', label: 'Situação', type: 'select', options: [['1', 'Ativo'], ['0', 'Inativo']] }
    ],
    columns: ['nome', 'empresa', 'email', 'ativo']
  },
  {
    key: 'pedidos', title: 'Pedidos', singular: 'pedido', endpoint: '/pedidos',
    idField: 'id_pedido', icon: ShoppingCart, group: 'Operações',
    fields: [
      { name: 'id_cliente', label: 'Cliente', type: 'resource', resource: 'clientes', optionId: 'id_cliente', optionLabel: 'nome', required: true },
      { name: 'status', label: 'Situação', type: 'select', options: [['1', 'Em andamento'], ['0', 'Finalizado']] },
      { name: 'data_pedido', label: 'Data do pedido', type: 'date' }
    ],
    columns: ['id_cliente', 'status', 'data_pedido']
  },
  {
    key: 'entradas', title: 'Entradas', singular: 'entrada', endpoint: '/entradas',
    idField: 'id_entrada', icon: ArrowDownLeft, group: 'Operações',
    fields: [
      { name: 'id_produto', label: 'Produto', type: 'resource', resource: 'produtos', optionId: 'id_produto', optionLabel: 'nome', required: true },
      { name: 'id_fornecedor', label: 'Fornecedor', type: 'resource', resource: 'fornecedores', optionId: 'id_fornecedor', optionLabel: 'nome', required: true },
      { name: 'quantidade', label: 'Quantidade', type: 'number', min: '1', step: '1', required: true },
      { name: 'valor_unitario', label: 'Valor unitário', type: 'number', min: '0.01', step: '0.01', required: true },
      { name: 'data_entrada', label: 'Data da entrada', type: 'date' },
      { name: 'observacao', label: 'Observação' }
    ],
    columns: ['id_produto', 'id_fornecedor', 'quantidade', 'valor_unitario', 'data_entrada']
  },
  {
    key: 'saidas', title: 'Saídas', singular: 'saída', endpoint: '/saidas',
    idField: 'id_saida', icon: ArrowUpRight, group: 'Operações',
    fields: [
      { name: 'id_produto', label: 'Produto', type: 'resource', resource: 'produtos', optionId: 'id_produto', optionLabel: 'nome', required: true },
      { name: 'id_funcionario', label: 'ID do funcionário', type: 'number', min: '1', step: '1', required: true },
      { name: 'quantidade', label: 'Quantidade', type: 'number', min: '1', step: '1', required: true },
      { name: 'valor_unitario', label: 'Valor unitário', type: 'number', min: '0.01', step: '0.01', required: true },
      { name: 'data_saida', label: 'Data da saída', type: 'date' },
      { name: 'destino', label: 'Destino' }
    ],
    columns: ['id_produto', 'id_funcionario', 'quantidade', 'valor_unitario', 'data_saida']
  },
  {
    key: 'usuarios', title: 'Usuários', singular: 'usuário', endpoint: '/usuario',
    idField: 'id_usu', icon: UserRound, group: 'Administração',
    fields: [
      { name: 'nome', label: 'Nome completo', required: true },
      { name: 'email', label: 'E-mail', type: 'email', required: true },
      { name: 'senha', label: 'Senha', type: 'password', required: true, createOnly: true },
      { name: 'contato', label: 'Telefone / contato' },
      { name: 'genero', label: 'Gênero (M/F)' },
      { name: 'ativo', label: 'Situação', type: 'select', options: [['1', 'Ativo'], ['0', 'Inativo']] }
    ],
    columns: ['nome', 'email', 'contato', 'ativo']
  }
];

const groups = [
  { title: 'Visão geral', items: [{ key: 'dashboard', title: 'Painel', icon: LayoutDashboard }] },
  ...['Catálogo', 'Relacionamento', 'Operações', 'Administração'].map((title) => ({
    title,
    items: resources.filter((resource) => resource.group === title)
  })),
  { title: 'Estoque', items: [{ key: 'estoque', title: 'Controle de estoque', icon: Boxes }] }
];

async function request(path, options = {}) {
  let response;
  const token = getAccessToken();
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error(`Não foi possível conectar à API em ${API_URL}. Confira se o servidor está ativo.`);
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    if (response.status === 401 && token) {
      window.dispatchEvent(new Event('auth-expired'));
    }
    const message = payload?.error || payload?.erro?.mensagem || payload?.message;
    throw new Error(message || `A API respondeu com o status ${response.status}.`);
  }
  return payload;
}

function getResourceRows(resource, payload) {
  return payload?.[resource.key] || [];
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(sessionKey));
    } catch {
      return null;
    }
  });
  const [activeKey, setActiveKey] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const signIn = (account) => {
    sessionStorage.setItem(sessionKey, JSON.stringify(account));
    setUser(account);
  };
  const signOut = () => {
    sessionStorage.removeItem(sessionKey);
    setUser(null);
    setActiveKey('dashboard');
  };

  useEffect(() => {
    const handleAuthExpired = () => {
      sessionStorage.removeItem(sessionKey);
      setUser(null);
      setActiveKey('dashboard');
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  if (!user) return <Login onSignIn={signIn} />;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><Store size={20} strokeWidth={2.2} /></div>
          <span>vértice<span className="brand-dot">.</span></span>
          <button className="icon-button sidebar-close" aria-label="Fechar menu" onClick={() => setMobileMenuOpen(false)}><X size={19} /></button>
        </div>
        <div className="workspace-label">ESPAÇO DE TRABALHO</div>
        <button className="workspace-switch">
          <span className="workspace-avatar"><BriefcaseBusiness size={15} /></span>
          <span className="workspace-name"><strong>Minha loja</strong><small>Plano profissional</small></span>
          <ChevronDown size={16} className="muted-icon" />
        </button>
        <nav className="side-nav" aria-label="Navegação principal">
          {groups.map((group) => (
            <div className="nav-group" key={group.title}>
              <p className="nav-group-title">{group.title}</p>
              {group.items.map(({ key, title, icon: Icon }) => (
                <button
                  className={`nav-link ${activeKey === key ? 'nav-link-active' : ''}`}
                  key={key}
                  onClick={() => { setActiveKey(key); setMobileMenuOpen(false); }}
                >
                  <Icon size={18} strokeWidth={1.8} /><span>{title}</span>
                  {key === 'estoque' && <span className="nav-dot" />}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><Sparkles size={16} /></div>
            <strong>Precisa de ajuda?</strong>
            <span>Consulte a documentação da API para detalhes das operações.</span>
          </div>
          <button className="nav-link" onClick={signOut}><LogOut size={18} /><span>Sair da conta</span></button>
          <div className="profile-card">
            <div className="avatar">{initials(user.nome)}</div>
            <div className="profile-copy"><strong>{user.nome}</strong><span>Administrador</span></div>
            <button className="icon-button profile-menu" aria-label="Sair" onClick={signOut}><Ellipsis size={19} /></button>
          </div>
        </div>
      </aside>
      {mobileMenuOpen && <button className="sidebar-backdrop" aria-label="Fechar menu" onClick={() => setMobileMenuOpen(false)} />}
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            <button className="icon-button mobile-menu-button" aria-label="Abrir menu" onClick={() => setMobileMenuOpen(true)}><Menu size={20} /></button>
            <span>Workspace</span><ChevronRight size={15} /><strong>{getScreenTitle(activeKey)}</strong>
          </div>
          <div className="topbar-right">
            <span className="today-label">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date())}</span>
            <div className="topbar-avatar">{initials(user.nome)}</div>
          </div>
        </header>
        <div className="page-content">
          {activeKey === 'dashboard'
            ? <Dashboard onNavigate={setActiveKey} />
            : activeKey === 'estoque'
              ? <StockPage />
              : <ResourcePage key={activeKey} resource={resources.find((item) => item.key === activeKey)} />}
          <footer className="page-footer"><span>© {new Date().getFullYear()} Vértice Gestão</span><span>Feito para simplificar sua operação <Sparkles size={13} /></span></footer>
        </div>
      </main>
    </div>
  );
}

function Login({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await request('/usuario/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
      });
      onSignIn({ ...result.usuario, token: result.token });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <section className="login-brand-panel">
        <div className="login-brand"><span className="brand-mark"><Store size={20} /></span><span>vértice<span className="brand-dot">.</span></span></div>
        <div className="login-hero">
          <span className="eyebrow"><span className="eyebrow-dot" /> GESTÃO INTELIGENTE</span>
          <h1>Seu negócio,<br />em <em>movimento.</em></h1>
          <p>Uma visão clara de cada detalhe da sua operação. Do primeiro pedido ao último item do estoque.</p>
          <div className="hero-art" aria-hidden="true">
            <div className="art-glow" />
            <div className="art-card art-card-main">
              <div className="art-card-head"><span>Resumo de vendas</span><span className="art-period">Últimos 7 dias⌄</span></div>
              <strong>R$ 12.840,50</strong><span className="art-growth">↗ 18,6% <small>vs. semana anterior</small></span>
              <div className="chart-bars">{[38, 55, 42, 75, 58, 90, 68, 96, 73, 84, 62, 100, 79, 91].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
              <div className="chart-days"><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span><span>DOM</span></div>
            </div>
            <div className="art-card art-card-stock"><span className="stock-card-icon"><Package size={17} /></span><div><small>Estoque ativo</small><strong>248 produtos</strong></div><span className="stock-card-arrow"><ArrowUpRight size={14} /></span></div>
            <span className="art-sparkle sparkle-one">✳</span><span className="art-sparkle sparkle-two">✳</span>
          </div>
        </div>
        <div className="login-foot"><span>© {new Date().getFullYear()} Vértice Gestão</span><span>Feito para quem faz acontecer</span></div>
      </section>
      <section className="login-form-panel">
        <div className="login-mobile-brand"><span className="brand-mark"><Store size={20} /></span><span>vértice<span className="brand-dot">.</span></span></div>
        <div className="login-form-wrap">
          <div className="login-welcome-icon"><LockKeyhole size={21} /></div>
          <span className="form-eyebrow">BEM-VINDO DE VOLTA</span>
          <h2>Acesse sua conta</h2>
          <p className="form-intro">Entre com suas credenciais para continuar.</p>
          <form onSubmit={submit}>
            <label className="field-label" htmlFor="login-email">E-mail</label>
            <div className="input-wrap"><UserRound size={17} /><input id="login-email" type="email" placeholder="voce@sualoja.com.br" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            <div className="password-label"><label className="field-label" htmlFor="login-password">Senha</label></div>
            <div className="input-wrap"><LockKeyhole size={17} /><input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="Sua senha" autoComplete="current-password" value={senha} onChange={(event) => setSenha(event.target.value)} required /><button type="button" className="password-toggle" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>
            {error && <div className="alert alert-error"><CircleAlert size={16} />{error}</div>}
            <button className="primary-button login-submit" disabled={loading}>{loading ? <span className="spinner" /> : <>Entrar na plataforma <ArrowRight size={17} /></>}</button>
          </form>
          <div className="login-security"><ShieldCheck size={16} /><span>Seus dados são protegidos com segurança</span></div>
        </div>
        <div className="login-form-footer">Ainda não tem uma conta? <span>Fale com o administrador</span></div>
      </section>
    </div>
  );
}

function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const load = useCallback(async () => {
    setLoading(true);
    const results = await Promise.all(resources.map(async (resource) => {
      try {
        const payload = await request(resource.endpoint);
        return { key: resource.key, count: getResourceRows(resource, payload).length };
      } catch (error) {
        return { key: resource.key, error: error.message };
      }
    }));
    setStats(Object.fromEntries(results.map((result) => [result.key, result.count])));
    setErrors(results.filter((result) => result.error));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="welcome-strip">
        <div className="welcome-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> SEU NEGÓCIO EM UM SÓ LUGAR</span>
          <h1>Bom dia, <em>que bom ter você.</em></h1>
          <p>Acompanhe sua operação e mantenha tudo em movimento.</p>
        </div>
        <div className="welcome-illustration" aria-hidden="true"><div className="illustration-circle"><Store size={34} /></div><span className="illustration-star star-a">✳</span><span className="illustration-star star-b">✳</span><span className="illustration-dash" /></div>
      </div>
      <div className="page-heading dashboard-heading">
        <div><span className="section-kicker">VISÃO GERAL</span><h2>Resumo da operação</h2><p>Os principais números da sua loja em um só lugar.</p></div>
        <button className="secondary-button" onClick={load} disabled={loading}><SlidersHorizontal size={16} />Atualizar dados</button>
      </div>
      {errors.length > 0 && <div className="alert alert-warning"><CircleAlert size={17} /><span>Não foi possível carregar: {errors.map((item) => `${resources.find((resource) => resource.key === item.key)?.title || item.key} (${item.error})`).join('; ')}</span></div>}
      <div className="stats-grid">
        <StatCard title="Produtos cadastrados" value={stats?.produtos} icon={Package} color="violet" detail="itens no catálogo" loading={loading} onClick={() => onNavigate('produtos')} />
        <StatCard title="Clientes" value={stats?.clientes} icon={Users} color="blue" detail="clientes registrados" loading={loading} onClick={() => onNavigate('clientes')} />
        <StatCard title="Pedidos" value={stats?.pedidos} icon={ShoppingBag} color="orange" detail="pedidos registrados" loading={loading} onClick={() => onNavigate('pedidos')} />
        <StatCard title="Fornecedores" value={stats?.fornecedores} icon={Truck} color="green" detail="parceiros cadastrados" loading={loading} onClick={() => onNavigate('fornecedores')} />
      </div>
      <div className="dashboard-lower">
        <section className="panel quick-panel">
          <div className="panel-heading"><div><span className="section-kicker">ACESSO RÁPIDO</span><h3>O que você precisa fazer?</h3></div><span className="panel-heading-icon"><Sparkles size={17} /></span></div>
          <div className="quick-actions">
            <QuickAction icon={Plus} title="Cadastrar produto" description="Adicione itens ao catálogo" tone="violet" onClick={() => onNavigate('produtos')} />
            <QuickAction icon={UserRound} title="Novo cliente" description="Amplie sua base de clientes" tone="blue" onClick={() => onNavigate('clientes')} />
            <QuickAction icon={ArrowDownLeft} title="Registrar entrada" description="Atualize uma compra recebida" tone="green" onClick={() => onNavigate('entradas')} />
            <QuickAction icon={Boxes} title="Configurar estoque" description="Defina o saldo inicial de um item" tone="orange" onClick={() => onNavigate('estoque')} />
          </div>
        </section>
        <section className="panel operations-panel">
          <div className="panel-heading"><div><span className="section-kicker">GESTÃO</span><h3>Seus módulos</h3></div><button className="icon-button"><Ellipsis size={19} /></button></div>
          <div className="module-list">
            {[
              ['produtos', Package, 'Catálogo de produtos', 'Gerencie seus itens', 'violet'],
              ['pedidos', ShoppingCart, 'Pedidos', 'Acompanhe seus pedidos', 'orange'],
              ['entradas', ArrowDownLeft, 'Movimentações', 'Entradas e saídas', 'blue'],
              ['usuarios', UserRound, 'Equipe e acessos', 'Gerencie usuários', 'green']
            ].map(([key, Icon, title, subtitle, tone]) => (
              <button className="module-row" key={key} onClick={() => onNavigate(key)}><span className={`module-icon tone-${tone}`}><Icon size={17} /></span><span className="module-copy"><strong>{title}</strong><small>{subtitle}</small></span><ChevronRight size={16} className="module-arrow" /></button>
            ))}
          </div>
        </section>
      </div>
      <div className="dashboard-note"><span className="note-icon"><ShieldCheck size={17} /></span><span><strong>Um espaço seguro para crescer.</strong> Senhas protegidas e dados organizados, sempre acessíveis.</span><button onClick={() => onNavigate('usuarios')}>Ver usuários <ArrowRight size={14} /></button></div>
    </>
  );
}

function StatCard({ title, value, icon: Icon, color, detail, loading, onClick }) {
  return <button className="stat-card" onClick={onClick}><div className={`stat-icon tone-${color}`}><Icon size={19} /></div><span className="stat-label">{title}</span><strong className="stat-value">{loading ? <i className="skeleton skeleton-number" /> : value ?? '—'}</strong><span className="stat-detail">{detail}<ArrowUpRight size={14} /></span><span className="stat-decoration" /></button>;
}

function QuickAction({ icon: Icon, title, description, tone, onClick }) {
  return <button className="quick-action" onClick={onClick}><span className={`quick-icon tone-${tone}`}><Icon size={18} /></span><span><strong>{title}</strong><small>{description}</small></span><ArrowRight size={16} className="quick-arrow" /></button>;
}

function ResourcePage({ resource }) {
  const [rows, setRows] = useState([]);
  const [related, setRelated] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await request(resource.endpoint);
      setRows(getResourceRows(resource, payload));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => { loadRows(); }, [loadRows]);
  useEffect(() => {
    let active = true;
    const relatedResources = [...new Set(resource.fields.filter((field) => field.type === 'resource').map((field) => field.resource))];
    Promise.all(relatedResources.map(async (key) => {
      const relatedResource = resources.find((item) => item.key === key);
      const payload = await request(relatedResource.endpoint);
      return [key, getResourceRows(relatedResource, payload)];
    })).then((entries) => {
      if (active) setRelated(Object.fromEntries(entries));
    }).catch((loadError) => {
      if (active) setError(`Não foi possível carregar as opções relacionadas: ${loadError.message}`);
    });
    return () => { active = false; };
  }, [resource]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const filteredRows = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('pt-BR');
    return rows.filter((row) => {
      const matchesSearch = !term || Object.values(row).some((value) => String(value ?? '').toLocaleLowerCase('pt-BR').includes(term));
      const status = row.ativo ?? row.status;
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? Number(status) === 1 : Number(status) === 0);
      return matchesSearch && matchesStatus;
    });
  }, [query, rows, statusFilter]);

  const save = async (values) => {
    setError('');
    setNotice('');
    setSaving(true);
    try {
      if (modal.row) {
        const body = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ''));
        await request(`${resource.endpoint}/${modal.row[resource.idField]}`, { method: 'PATCH', body: JSON.stringify(body) });
        setNotice(`${capitalize(resource.singular)} atualizado com sucesso.`);
      } else {
        await request(resource.endpoint, { method: 'POST', body: JSON.stringify(values) });
        setNotice(`${capitalize(resource.singular)} cadastrado com sucesso.`);
      }
      setModal(null);
      await loadRows();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row) => {
    if (!window.confirm(`Deseja remover ${resource.singular} #${row[resource.idField]}? Esta ação não pode ser desfeita.`)) return;
    setError('');
    try {
      await request(`${resource.endpoint}/${row[resource.idField]}`, { method: 'DELETE' });
      setNotice(`${capitalize(resource.singular)} removido com sucesso.`);
      await loadRows();
    } catch (removeError) {
      setError(removeError.message);
    }
  };

  const columns = resource.columns;
  const Icon = resource.icon;
  const activeCount = rows.filter((row) => row.ativo === 1 || row.ativo === true || row.status === 1 || row.status === true).length;

  return (
    <>
      <div className="page-heading">
        <div><span className="section-kicker">{resource.group.toUpperCase()}</span><h1>{resource.title}</h1><p>Gerencie e acompanhe {resource.title.toLocaleLowerCase('pt-BR')} da sua loja.</p></div>
        <button className="primary-button" onClick={() => setModal({ row: null })}><Plus size={17} />Novo {resource.singular}</button>
      </div>
      {notice && <div className="toast"><Check size={16} />{notice}<button className="icon-button" onClick={() => setNotice('')} aria-label="Fechar aviso"><X size={15} /></button></div>}
      {error && <div className="alert alert-error"><CircleAlert size={17} /><span>{error}</span><button className="icon-button" aria-label="Fechar erro" onClick={() => setError('')}><X size={15} /></button></div>}
      <div className="resource-summary">
        <div className="resource-summary-main"><span className={`resource-icon tone-${resource.group === 'Operações' ? 'orange' : resource.group === 'Catálogo' ? 'violet' : resource.group === 'Administração' ? 'green' : 'blue'}`}><Icon size={20} /></span><div><span>Total de {resource.title.toLocaleLowerCase('pt-BR')}</span><strong>{loading ? '—' : rows.length.toString().padStart(2, '0')}<small> registros</small></strong></div></div>
        <div className="summary-divider" /><div className="summary-stat"><span>Ativos / em andamento</span><strong>{loading ? '—' : activeCount.toString().padStart(2, '0')}</strong></div>
        <div className="summary-stat"><span>Visualização</span><strong>Todos <ChevronDown size={14} /></strong></div>
      </div>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div><h3>Todos os {resource.title.toLocaleLowerCase('pt-BR')}</h3><span>{filteredRows.length} registro{filteredRows.length === 1 ? '' : 's'} encontrado{filteredRows.length === 1 ? '' : 's'}</span></div>
          <div className="table-actions"><label className="table-search"><Search size={16} /><input aria-label={`Buscar ${resource.title.toLocaleLowerCase('pt-BR')}`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar..." /></label>{resource.fields.some((field) => field.name === 'ativo' || field.name === 'status') && <label className="filter-select"><Filter size={14} /><select aria-label="Filtrar por situação" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">Todos</option><option value="active">{resource.key === 'pedidos' ? 'Em andamento' : 'Ativos'}</option><option value="inactive">{resource.key === 'pedidos' ? 'Finalizados' : 'Inativos'}</option></select><ChevronDown size={13} /></label>}<button className="icon-button export-button" aria-label="Exportar CSV" title="Exportar CSV" onClick={() => exportCsv(resource, filteredRows)}><Download size={17} /></button></div>
        </div>
        {loading ? <TableLoading /> : rows.length === 0 && !error ? <EmptyState resource={resource} onCreate={() => setModal({ row: null })} /> : filteredRows.length === 0 ? <div className="empty-search"><Search size={20} /><span>Nenhum registro corresponde à sua busca.</span></div> : (
          <div className="table-scroll"><table><thead><tr><th>ID</th>{columns.map((name) => <th key={name}>{getFieldLabel(resource, name)}</th>)}<th className="actions-heading">Ações</th></tr></thead><tbody>
            {filteredRows.map((row) => <tr key={row[resource.idField]}><td><span className="id-badge">#{row[resource.idField]}</span></td>{columns.map((name) => <td key={name}>{renderValue(resource, name, row[name], related)}</td>)}<td><div className="row-actions"><button className="icon-button edit-action" aria-label={`Editar ${resource.singular} ${row[resource.idField]}`} onClick={() => setModal({ row })}><Pencil size={15} /></button><button className="icon-button delete-action" aria-label={`Remover ${resource.singular} ${row[resource.idField]}`} onClick={() => remove(row)}><Trash2 size={15} /></button></div></td></tr>)}
          </tbody></table></div>
        )}
        <div className="table-footer"><span>Mostrando <strong>{filteredRows.length}</strong> de <strong>{rows.length}</strong> registros</span></div>
      </section>
      <FormModal key={`${resource.key}-${modal?.row?.[resource.idField] ?? 'new'}-${Boolean(modal)}`} resource={resource} modal={modal} related={related} saving={saving} onClose={() => setModal(null)} onSave={save} />
    </>
  );
}

function StockPage() {
  const [products, setProducts] = useState([]);
  const [values, setValues] = useState({ id_produto: '', quantidade: '0', estoque_minimo: '', estoque_maximo: '', localizacao: '' });
  const [stockId, setStockId] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingStock, setDeletingStock] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    request('/produtos')
      .then((payload) => setProducts(payload.produtos || []))
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoadingProducts(false));
  }, []);

  const createStock = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (values.estoque_minimo !== '' && values.estoque_maximo !== '' &&
        Number(values.estoque_minimo) > Number(values.estoque_maximo)) {
      setError('O estoque mínimo não pode ser maior que o estoque máximo.');
      return;
    }
    setSaving(true);
    const payload = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ''));
    for (const key of ['id_produto', 'quantidade', 'estoque_minimo', 'estoque_maximo']) {
      if (payload[key] !== undefined) payload[key] = Number(payload[key]);
    }
    try {
      const result = await request('/estoque', { method: 'POST', body: JSON.stringify(payload) });
      setNotice(`Estoque inicial criado com sucesso (registro #${result.id}).`);
      setValues({ id_produto: '', quantidade: '0', estoque_minimo: '', estoque_maximo: '', localizacao: '' });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteStock = async (event) => {
    event.preventDefault();
    if (!window.confirm(`Deseja remover o registro de estoque #${stockId}? A API permite remover somente registros com saldo zero.`)) return;
    setError('');
    setNotice('');
    setDeletingStock(true);
    try {
      const result = await request(`/estoque/${Number(stockId)}`, { method: 'DELETE' });
      setNotice(result.mensagem || 'Registro de estoque removido.');
      setStockId('');
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingStock(false);
    }
  };

  return (
    <>
      <div className="page-heading"><div><span className="section-kicker">CONTROLE DE INVENTÁRIO</span><h1>Estoque</h1><p>Configure o saldo inicial e os limites de estoque dos produtos.</p></div></div>
      {error && <div className="alert alert-error"><CircleAlert size={17} /><span>{error}</span><button className="icon-button" onClick={() => setError('')} aria-label="Fechar erro"><X size={15} /></button></div>}
      {notice && <div className="toast"><Check size={16} />{notice}<button className="icon-button" onClick={() => setNotice('')} aria-label="Fechar aviso"><X size={15} /></button></div>}
      <div className="stock-intro"><span className="stock-intro-icon"><Boxes size={22} /></span><div><strong>Saldo sempre sob controle</strong><p>Acompanhe os níveis de inventário e organize os limites de cada produto.</p></div><span className="stock-intro-decoration">✳</span></div>
      <div className="stock-layout">
        <section className="panel stock-form-panel">
          <div className="panel-heading"><div><span className="section-kicker">NOVO REGISTRO</span><h3>Estoque inicial</h3><p>Cadastre o saldo inicial de um produto.</p></div><span className="panel-heading-icon"><Package size={18} /></span></div>
          <form className="stock-form" onSubmit={createStock}>
            <FormField field={{ name: 'id_produto', label: 'Produto', type: 'resource', required: true }} value={values.id_produto} onChange={setValues} related={{ produtos: products }} disabled={loadingProducts} />
            <div className="form-grid">
              <FormField field={{ name: 'quantidade', label: 'Quantidade atual', type: 'number', min: '0', step: '1', required: true }} value={values.quantidade} onChange={setValues} />
              <FormField field={{ name: 'localizacao', label: 'Localização' }} value={values.localizacao} onChange={setValues} />
              <FormField field={{ name: 'estoque_minimo', label: 'Estoque mínimo', type: 'number', min: '0', step: '1' }} value={values.estoque_minimo} onChange={setValues} />
              <FormField field={{ name: 'estoque_maximo', label: 'Estoque máximo', type: 'number', min: '0', step: '1' }} value={values.estoque_maximo} onChange={setValues} />
            </div>
            <div className="stock-hint"><CircleAlert size={15} /><span>Um produto pode ter apenas um registro de estoque. O mínimo não pode superar o máximo.</span></div>
            <button className="primary-button stock-submit" disabled={saving || loadingProducts}>{saving ? <span className="spinner" /> : <><Plus size={17} />Cadastrar estoque</>}</button>
          </form>
        </section>
        <section className="panel stock-delete-panel">
          <div className="stock-delete-icon"><Trash2 size={19} /></div><span className="section-kicker">GERENCIAR REGISTRO</span><h3>Remover estoque</h3><p>A API permite remover somente registros cujo saldo atual seja zero. Informe o ID do registro.</p>
          <form onSubmit={deleteStock}><label className="field-label" htmlFor="stock-id">ID do registro de estoque</label><div className="stock-delete-controls"><input id="stock-id" type="number" min="1" step="1" value={stockId} onChange={(event) => setStockId(event.target.value)} placeholder="Ex.: 12" required /><button className="secondary-button danger-outline" disabled={deletingStock}>{deletingStock ? 'Removendo...' : 'Remover'}</button></div></form>
          <div className="stock-api-note"><ShieldCheck size={16} /><span>A listagem, consulta e atualização de estoque ainda não estão disponíveis na API.</span></div>
        </section>
      </div>
    </>
  );
}

function FormModal({ resource, modal, related, saving, onClose, onSave }) {
  const row = modal?.row;
  const [values, setValues] = useState(() => Object.fromEntries(resource.fields
    .filter((field) => !field.createOnly || !row)
    .map((field) => [field.name, row?.[field.name] == null ? '' : String(row[field.name])])));

  if (!modal) return null;

  const submit = (event) => {
    event.preventDefault();
    const payload = { ...values };
    for (const field of resource.fields) {
      if (field.type === 'number' && payload[field.name] !== '') payload[field.name] = Number(payload[field.name]);
    }
    onSave(payload);
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="form-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading"><div><span className="section-kicker">{row ? 'EDITAR REGISTRO' : 'NOVO CADASTRO'}</span><h2 id="modal-title">{row ? `Editar ${resource.singular}` : `Cadastrar ${resource.singular}`}</h2><p>Preencha os campos para {row ? 'atualizar' : 'adicionar'} as informações.</p></div><button className="icon-button" onClick={onClose} aria-label="Fechar formulário"><X size={19} /></button></div>
        <form className="modal-form" onSubmit={submit}><div className="modal-fields">{resource.fields.filter((field) => !field.createOnly || !row).map((field) => <FormField key={field.name} field={field} value={values[field.name] ?? ''} onChange={setValues} related={related} />)}</div><div className="modal-footer"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? <span className="spinner" /> : <><Check size={16} />{row ? 'Salvar alterações' : 'Criar cadastro'}</>}</button></div></form>
      </section>
    </div>
  );
}

function FormField({ field, value, onChange, related = {}, disabled = false }) {
  const setValue = (nextValue) => onChange((previous) => ({ ...previous, [field.name]: nextValue }));
  const inputType = field.type === 'resource' ? 'select' : field.type || 'text';

  return (
    <div className="form-field">
      <label className="field-label" htmlFor={`field-${field.name}`}>{field.label}{field.required && <span className="required-mark"> *</span>}</label>
      {inputType === 'select' ? <div className="select-wrap"><select id={`field-${field.name}`} value={value} onChange={(event) => setValue(event.target.value)} required={field.required} disabled={disabled}><option value="">{disabled ? 'Carregando opções...' : 'Selecione uma opção'}</option>{field.type === 'resource' ? (related[field.resource] || []).map((option) => <option key={option[field.optionId]} value={option[field.optionId]}>{option[field.optionLabel]} · #{option[field.optionId]}</option>) : field.options.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}</select><ChevronDown size={16} /></div> : <input id={`field-${field.name}`} type={inputType} step={field.step || (field.type === 'number' ? '1' : undefined)} value={value} onChange={(event) => setValue(event.target.value)} required={field.required} min={field.type === 'number' ? field.min ?? '0' : undefined} /> }
    </div>
  );
}

function TableLoading() {
  return <div className="table-loading">{[0, 1, 2, 3, 4].map((item) => <div className="loading-row" key={item}><i className="skeleton skeleton-check" /><i className="skeleton skeleton-id" /><i className="skeleton skeleton-name" /><i className="skeleton skeleton-email" /><i className="skeleton skeleton-status" /></div>)}</div>;
}

function EmptyState({ resource, onCreate }) {
  const Icon = resource.icon;
  return <div className="empty-state"><div className="empty-icon"><Icon size={23} /></div><h3>Nenhum {resource.singular} por aqui ainda</h3><p>Comece adicionando o primeiro registro para organizar melhor sua operação.</p><button className="primary-button" onClick={onCreate}><Plus size={16} />Cadastrar {resource.singular}</button></div>;
}

function renderValue(resource, name, value, related) {
  if (name === 'preco' || name === 'valor_unitario') return <span className="money-value">{formatCurrency(value)}</span>;
  if (name === 'status' || name === 'ativo') {
    const isActive = Number(value) === 1;
    const label = name === 'status' ? (isActive ? 'Em andamento' : 'Finalizado') : (isActive ? 'Ativo' : 'Inativo');
    return <span className={`status-pill ${isActive ? 'status-active' : 'status-inactive'}`}><i />{label}</span>;
  }
  if (name.startsWith('id_')) {
    const key = name === 'id_cliente' ? 'clientes' : name === 'id_produto' ? 'produtos' : name === 'id_fornecedor' ? 'fornecedores' : '';
    const option = key && (related[key] || []).find((item) => item[resources.find((item) => item.key === key)?.idField] === Number(value));
    return <span className="relation-value">{option?.nome || `#${value}`}</span>;
  }
  if (name.startsWith('data_')) return <span className="date-value">{formatDate(value)}</span>;
  if (name === 'nome') return <span className="primary-cell">{value || '—'}</span>;
  return <span className="secondary-cell">{value || '—'}</span>;
}

function getFieldLabel(resource, name) {
  return resource.fields.find((field) => field.name === name)?.label || name.replaceAll('_', ' ');
}

function exportCsv(resource, rows) {
  if (!rows.length) return;
  const fields = [resource.idField, ...resource.columns];
  const quote = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const csv = [fields.map((field) => quote(getFieldLabel(resource, field))).join(','), ...rows.map((row) => fields.map((field) => quote(row[field])).join(','))].join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${resource.key}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function getScreenTitle(key) {
  if (key === 'dashboard') return 'Painel';
  if (key === 'estoque') return 'Estoque';
  return resources.find((resource) => resource.key === key)?.title || 'Painel';
}

function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('pt-BR') || 'U';
}

function capitalize(value) {
  return value.charAt(0).toLocaleUpperCase('pt-BR') + value.slice(1);
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('pt-BR');
}

export default App;
