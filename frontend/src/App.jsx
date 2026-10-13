import { useEffect, useMemo, useState } from 'react';
import { Activity, CalendarDays, CheckCircle2, ChevronRight, ClipboardList, HeartPulse, LogOut, Menu, Plus, Search, Stethoscope, Users, X, Trash2, Pencil, RefreshCw } from 'lucide-react';
import { api } from './api';

const emptyPatient = { fullName: '', age: '', gender: 'Female', phone: '', email: '', address: '' };
const emptyDoctor = { fullName: '', specialization: '', phone: '', email: '', availableDays: 'Monday - Friday' };
const emptyAppointment = { patientId: '', doctorId: '', appointmentDate: '', reason: '', status: 'BOOKED' };

function App() {
  const [token, setToken] = useState(localStorage.getItem('hospital_token') || '');
  const [username, setUsername] = useState(localStorage.getItem('hospital_username') || '');
  const [authMode, setAuthMode] = useState('login');
  const [auth, setAuth] = useState({ username: '', password: '' });
  const [active, setActive] = useState('Overview');
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sections = [
    { name: 'Overview', icon: Activity },
    { name: 'Patients', icon: Users },
    { name: 'Doctors', icon: Stethoscope },
    { name: 'Appointments', icon: CalendarDays }
  ];

  async function loadAll() {
    if (!token) return;
    try {
      const [p, d, a] = await Promise.all([
        api.get('/patients'), api.get('/doctors'), api.get('/appointments')
      ]);
      setPatients(p.data); setDoctors(d.data); setAppointments(a.data); setError('');
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) logout();
      else setError(e.response?.data?.message || e.response?.data?.error || 'Could not load data. Check that the backend and database are running.');
    }
  }

  useEffect(() => { loadAll(); }, [token]);
  const upcoming = useMemo(() => [...appointments].sort((a,b) => (a.appointmentDate || '').localeCompare(b.appointmentDate || '')).slice(0, 5), [appointments]);

  async function submitAuth(e) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      if (authMode === 'register') {
        await api.post('/auth/register', auth);
        setNotice('Account created. Please log in.');
        setAuthMode('login');
      } else {
        const response = await api.post('/auth/login', auth);
        localStorage.setItem('hospital_token', response.data.token);
        localStorage.setItem('hospital_username', response.data.username);
        setToken(response.data.token); setUsername(response.data.username);
      }
    } catch (e) { setError(e.response?.data?.message || e.response?.data?.error || 'Authentication failed. Check the backend connection and your details.'); }
    finally { setBusy(false); }
  }

  function logout() {
    localStorage.removeItem('hospital_token'); localStorage.removeItem('hospital_username');
    setToken(''); setUsername(''); setPatients([]); setDoctors([]); setAppointments([]);
  }

  function openCreate(type) {
    setEditing(null);
    setForm(type === 'Patients' ? {...emptyPatient} : type === 'Doctors' ? {...emptyDoctor} : {...emptyAppointment});
    setModal(type);
  }
  function openEdit(type, item) {
    setEditing(item.id);
    setForm({...item, age: item.age ?? '', patientId: item.patientId ?? '', doctorId: item.doctorId ?? '', appointmentDate: item.appointmentDate ?? ''});
    setModal(type);
  }
  async function saveRecord(e) {
    e.preventDefault(); setBusy(true); setError(''); setNotice('');
    const endpoint = `/${modal.toLowerCase()}`;
    let payload = {...form};
    if (modal === 'Patients' && payload.age !== '') payload.age = Number(payload.age);
    if (modal === 'Appointments') { payload.patientId = Number(payload.patientId); payload.doctorId = Number(payload.doctorId); }
    try {
      if (editing) await api.put(`${endpoint}/${editing}`, payload);
      else await api.post(endpoint, payload);
      setModal(''); setNotice(`${modal.slice(0,-1)} ${editing ? 'updated' : 'added'} successfully.`);
      await loadAll();
    } catch (e) { setError(e.response?.data?.message || e.response?.data?.error || 'Could not save record. Please check the form and backend.'); }
    finally { setBusy(false); }
  }
  async function removeRecord(type, id) {
    if (!window.confirm('Delete this record? This action cannot be undone.')) return;
    try {
      await api.delete(`/${type.toLowerCase()}/${id}`);
      setNotice('Record deleted successfully.'); await loadAll();
    } catch (e) { setError(e.response?.data?.message || 'Could not delete record.'); }
  }

  const filteredPatients = patients.filter(x => `${x.fullName} ${x.email} ${x.phone} ${x.id}`.toLowerCase().includes(search.toLowerCase()));
  const filteredDoctors = doctors.filter(x => `${x.fullName} ${x.specialization} ${x.email} ${x.id}`.toLowerCase().includes(search.toLowerCase()));
  const filteredAppointments = appointments.filter(x => `${x.id} ${x.patientId} ${x.doctorId} ${x.status} ${x.appointmentDate}`.toLowerCase().includes(search.toLowerCase()));

  if (!token) return <div className="auth-shell">
    <div className="auth-art">
      <div className="brand brand-light"><span className="brand-mark"><HeartPulse size={23}/></span><span>CarePoint</span></div>
      <div className="art-copy"><span className="eyebrow">HOSPITAL MANAGEMENT</span><h1>Care that connects.<br/><em>Care that counts.</em></h1><p>A simple, secure workspace for keeping patient records, doctors and appointments organized.</p></div>
      <div className="art-bottom"><div className="pulse-line"></div><span>Patient-first. Every day.</span></div>
    </div>
    <div className="auth-panel">
      <div className="auth-card">
        <div className="mobile-brand brand"><span className="brand-mark"><HeartPulse size={22}/></span><span>CarePoint</span></div>
        <span className="eyebrow">WELCOME TO CAREPOINT</span>
        <h2>{authMode === 'login' ? 'Sign in to your workspace' : 'Create your account'}</h2>
        <p className="muted">{authMode === 'login' ? 'Enter your details to continue.' : 'Register to access the demo dashboard.'}</p>
        {notice && <div className="notice"><CheckCircle2 size={17}/>{notice}</div>}
        {error && <div className="alert">{error}</div>}
        <form onSubmit={submitAuth} className="stack-form">
          <label>Username<input required minLength="3" value={auth.username} onChange={e=>setAuth({...auth, username:e.target.value})} placeholder="Enter username" autoComplete="username"/></label>
          <label>Password<input required minLength="6" type="password" value={auth.password} onChange={e=>setAuth({...auth, password:e.target.value})} placeholder="At least 6 characters" autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}/></label>
          <button className="primary full" disabled={busy}>{busy ? 'Please wait…' : authMode === 'login' ? 'Sign in' : 'Create account'}<ChevronRight size={18}/></button>
        </form>
        <p className="switch-auth">{authMode === 'login' ? 'New to CarePoint?' : 'Already registered?'} <button onClick={()=>{setAuthMode(authMode==='login'?'register':'login');setError('');setNotice('');}}>{authMode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
        <div className="security-note"><span className="secure-dot"></span>Protected API access with JWT authentication</div>
      </div>
    </div>
  </div>;

  return <div className="app-shell">
    {sidebarOpen && <div className="mobile-overlay" onClick={()=>setSidebarOpen(false)} />}
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><HeartPulse size={23}/></span><span>CarePoint</span></div>
      <div className="side-label">WORKSPACE</div>
      <nav>{sections.map(item => <button key={item.name} className={`nav-item ${active===item.name?'nav-active':''}`} onClick={()=>{setActive(item.name);setSidebarOpen(false);setSearch('');setNotice('');setError('');}}><item.icon size={19}/><span>{item.name}</span>{active===item.name && <span className="nav-indicator"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><HeartPulse size={19}/></div><strong>Care starts here</strong><p>Keep your hospital information organized in one place.</p></div><div className="profile"><div className="avatar">{(username[0]||'U').toUpperCase()}</div><div className="profile-info"><strong>{username}</strong><span>Signed-in user</span></div><button className="icon-button logout-btn" title="Sign out" onClick={logout}><LogOut size={17}/></button></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><button className="icon-button menu-btn" onClick={()=>setSidebarOpen(!sidebarOpen)}><Menu size={20}/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/><strong>{active}</strong></div><div className="topbar-right"><span className="live-dot"></span><span className="system-label">System workspace</span><div className="avatar small-avatar">{(username[0]||'U').toUpperCase()}</div></div></header>
      <div className="page-content">
        <div className="page-heading"><div><span className="eyebrow">HOSPITAL OPERATIONS</span><h1>{active === 'Overview' ? 'Good day, ' + username : active}</h1><p>{active === 'Overview' ? 'Here is what is happening at your hospital today.' : active === 'Patients' ? 'Manage patient records and contact details.' : active === 'Doctors' ? 'Keep your medical team directory up to date.' : 'Schedule and track patient appointments.'}</p></div><div className="heading-actions"><button className="secondary" onClick={loadAll}><RefreshCw size={16}/> Refresh</button>{active!=='Overview' && <button className="primary" onClick={()=>openCreate(active)}><Plus size={17}/> Add {active.slice(0,-1)}</button>}</div></div>
        {notice && <div className="notice page-notice"><CheckCircle2 size={17}/>{notice}<button className="close-notice" onClick={()=>setNotice('')}><X size={15}/></button></div>}
        {error && <div className="alert page-alert">{error}<button className="close-notice" onClick={()=>setError('')}><X size={15}/></button></div>}
        {active==='Overview' && <>
          <div className="welcome-banner"><div><span className="banner-kicker">CAREPOINT OVERVIEW</span><h2>Better organization.<br/>More time for care.</h2><p>Manage essential hospital information from one workspace.</p><button className="banner-button" onClick={()=>setActive('Appointments')}>View appointments <ChevronRight size={16}/></button></div><div className="banner-art"><div className="circle circle-one"></div><div className="circle circle-two"></div><div className="medical-card"><HeartPulse size={36}/><span>Care in sync</span><div className="mini-chart"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div></div>
          <div className="stat-grid">
            <StatCard title="Total patients" value={patients.length} note="Registered records" icon={Users} tone="teal"/>
            <StatCard title="Medical team" value={doctors.length} note="Doctors on directory" icon={Stethoscope} tone="blue"/>
            <StatCard title="Appointments" value={appointments.length} note="All scheduled records" icon={CalendarDays} tone="purple"/>
            <StatCard title="Booked" value={appointments.filter(a=>a.status==='BOOKED').length} note="Awaiting appointment" icon={ClipboardList} tone="amber"/>
          </div>
          <section className="panel"><div className="panel-heading"><div><h3>Recent appointments</h3><p>Your next five scheduled records</p></div><button className="text-button" onClick={()=>setActive('Appointments')}>View all <ChevronRight size={15}/></button></div><AppointmentTable appointments={upcoming} patients={patients} doctors={doctors} compact/></section>
          <div className="quick-grid"><button className="quick-card" onClick={()=>openCreate('Patients')}><span className="quick-icon teal-bg"><Users size={20}/></span><span><strong>Register patient</strong><small>Add a new patient record</small></span><Plus size={17}/></button><button className="quick-card" onClick={()=>openCreate('Doctors')}><span className="quick-icon blue-bg"><Stethoscope size={20}/></span><span><strong>Add doctor</strong><small>Update the medical team</small></span><Plus size={17}/></button><button className="quick-card" onClick={()=>openCreate('Appointments')}><span className="quick-icon purple-bg"><CalendarDays size={20}/></span><span><strong>Book appointment</strong><small>Schedule a patient visit</small></span><Plus size={17}/></button></div>
        </>}
        {active!=='Overview' && <section className="panel table-panel"><div className="panel-heading"><div><h3>{active} directory</h3><p>{active==='Patients'?`${patients.length} patient records`:active==='Doctors'?`${doctors.length} doctor records`:`${appointments.length} appointment records`}</p></div><div className="table-tools"><div className="search-box"><Search size={16}/><input placeholder="Search records…" value={search} onChange={e=>setSearch(e.target.value)}/></div></div></div>
          {active==='Patients' && <PatientTable patients={filteredPatients} onEdit={x=>openEdit('Patients',x)} onDelete={id=>removeRecord('Patients',id)}/>}
          {active==='Doctors' && <DoctorTable doctors={filteredDoctors} onEdit={x=>openEdit('Doctors',x)} onDelete={id=>removeRecord('Doctors',id)}/>}
          {active==='Appointments' && <AppointmentTable appointments={filteredAppointments} patients={patients} doctors={doctors} onEdit={x=>openEdit('Appointments',x)} onDelete={id=>removeRecord('Appointments',id)}/>}
          {((active==='Patients'&&filteredPatients.length===0)||(active==='Doctors'&&filteredDoctors.length===0)||(active==='Appointments'&&filteredAppointments.length===0)) && <div className="empty-state"><div className="empty-icon"><ClipboardList size={25}/></div><h3>No records found</h3><p>Try a different search or add a new record.</p><button className="primary" onClick={()=>openCreate(active)}><Plus size={16}/> Add {active.slice(0,-1)}</button></div>}
        </section>}
        <footer className="footer"><span>© {new Date().getFullYear()} CarePoint Hospital Management</span><span><span className="live-dot"></span> Demo environment · Use fictional data</span></footer>
      </div>
    </main>
    {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal('');}}><div className="modal-card"><div className="modal-heading"><div><span className="eyebrow">{editing?'UPDATE RECORD':'NEW RECORD'}</span><h2>{editing?'Edit':'Add'} {modal.slice(0,-1)}</h2></div><button className="icon-button" onClick={()=>setModal('')}><X size={19}/></button></div><form onSubmit={saveRecord} className="record-form">
      {modal==='Patients' && <><label>Full name *<input required value={form.fullName||''} onChange={e=>setForm({...form,fullName:e.target.value})} placeholder="Patient full name"/></label><div className="form-row"><label>Age<input type="number" min="0" max="125" value={form.age??''} onChange={e=>setForm({...form,age:e.target.value})} placeholder="Age"/></label><label>Gender<select value={form.gender||'Female'} onChange={e=>setForm({...form,gender:e.target.value})}><option>Female</option><option>Male</option><option>Other</option><option>Prefer not to say</option></select></label></div><div className="form-row"><label>Phone<input value={form.phone||''} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone number"/></label><label>Email<input type="email" value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email address"/></label></div><label>Address<input value={form.address||''} onChange={e=>setForm({...form,address:e.target.value})} placeholder="City or address"/></label></>}
      {modal==='Doctors' && <><label>Doctor name *<input required value={form.fullName||''} onChange={e=>setForm({...form,fullName:e.target.value})} placeholder="Dr. Full Name"/></label><label>Specialization *<input required value={form.specialization||''} onChange={e=>setForm({...form,specialization:e.target.value})} placeholder="e.g. Cardiology"/></label><div className="form-row"><label>Phone<input value={form.phone||''} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone number"/></label><label>Email<input type="email" value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email address"/></label></div><label>Available days<input value={form.availableDays||''} onChange={e=>setForm({...form,availableDays:e.target.value})} placeholder="Monday - Friday"/></label></>}
      {modal==='Appointments' && <><div className="form-row"><label>Patient ID *<input required type="number" min="1" value={form.patientId??''} onChange={e=>setForm({...form,patientId:e.target.value})} placeholder="Existing patient ID"/></label><label>Doctor ID *<input required type="number" min="1" value={form.doctorId??''} onChange={e=>setForm({...form,doctorId:e.target.value})} placeholder="Existing doctor ID"/></label></div><label>Appointment date *<input required type="date" value={form.appointmentDate||''} onChange={e=>setForm({...form,appointmentDate:e.target.value})}/></label><label>Reason for visit<input value={form.reason||''} onChange={e=>setForm({...form,reason:e.target.value})} placeholder="Brief reason (avoid sensitive details)"/></label><label>Status<select value={form.status||'BOOKED'} onChange={e=>setForm({...form,status:e.target.value})}><option value="BOOKED">Booked</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></label><p className="form-hint">Create the patient and doctor records first. Use their numeric IDs shown in the tables.</p></>}
      <div className="modal-actions"><button type="button" className="secondary" onClick={()=>setModal('')}>Cancel</button><button className="primary" disabled={busy}>{busy?'Saving…':editing?'Save changes':'Save record'}</button></div>
    </form></div></div>}
  </div>;
}

function StatCard({title,value,note,icon:Icon,tone}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={20}/></div><span className="stat-title">{title}</span><strong className="stat-value">{value}</strong><span className="stat-note">{note}</span></div>; }
function PatientTable({patients,onEdit,onDelete}) { return <div className="table-scroll"><table><thead><tr><th>Patient</th><th>Patient ID</th><th>Age / Gender</th><th>Contact</th><th>Address</th><th>Actions</th></tr></thead><tbody>{patients.map(p=><tr key={p.id}><td><div className="person-cell"><span className="person-avatar">{(p.fullName||'P')[0].toUpperCase()}</span><span><strong>{p.fullName}</strong><small>{p.email||'No email added'}</small></span></div></td><td><span className="id-tag">PT-{String(p.id).padStart(4,'0')}</span></td><td>{p.age??'—'} / {p.gender||'—'}</td><td>{p.phone||'—'}</td><td>{p.address||'—'}</td><td><Actions item={p} onEdit={onEdit} onDelete={onDelete}/></td></tr>)}</tbody></table></div>; }
function DoctorTable({doctors,onEdit,onDelete}) { return <div className="table-scroll"><table><thead><tr><th>Doctor</th><th>Doctor ID</th><th>Specialization</th><th>Phone</th><th>Available days</th><th>Actions</th></tr></thead><tbody>{doctors.map(d=><tr key={d.id}><td><div className="person-cell"><span className="person-avatar doctor-avatar"><Stethoscope size={17}/></span><span><strong>{d.fullName}</strong><small>{d.email||'No email added'}</small></span></div></td><td><span className="id-tag">DR-{String(d.id).padStart(4,'0')}</span></td><td><span className="specialty-tag">{d.specialization}</span></td><td>{d.phone||'—'}</td><td>{d.availableDays||'—'}</td><td><Actions item={d} onEdit={onEdit} onDelete={onDelete}/></td></tr>)}</tbody></table></div>; }
function AppointmentTable({appointments,patients,doctors,onEdit,onDelete,compact=false}) {
  const patientName = id => patients.find(p=>p.id===id)?.fullName || `Patient #${id}`;
  const doctorName = id => doctors.find(d=>d.id===id)?.fullName || `Doctor #${id}`;
  return <div className="table-scroll"><table><thead><tr><th>Appointment</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th>{!compact&&<th>Actions</th>}</tr></thead><tbody>{appointments.map(a=><tr key={a.id}><td><span className="id-tag">APT-{String(a.id).padStart(4,'0')}</span><small className="sub-cell">{a.reason||'General visit'}</small></td><td><strong>{patientName(a.patientId)}</strong><small className="sub-cell">ID: {a.patientId}</small></td><td><strong>{doctorName(a.doctorId)}</strong><small className="sub-cell">ID: {a.doctorId}</small></td><td>{a.appointmentDate||'—'}</td><td><span className={`status-pill ${(a.status||'BOOKED').toLowerCase()}`}>{a.status||'BOOKED'}</span></td>{!compact&&<td><Actions item={a} onEdit={onEdit} onDelete={onDelete}/></td>}</tr>)}</tbody></table>{appointments.length===0&&<div className="table-empty">No appointments yet.</div>}</div>;
}
function Actions({item,onEdit,onDelete}) { return <div className="actions"><button className="row-action edit-action" title="Edit" onClick={()=>onEdit(item)}><Pencil size={15}/></button><button className="row-action delete-action" title="Delete" onClick={()=>onDelete(item.id)}><Trash2 size={15}/></button></div>; }
export default App;
