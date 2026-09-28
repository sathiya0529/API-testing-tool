import { useState } from 'react';
import { Tabs, TabPanel } from '../ui/Tabs';
import ParamsPanel from './ParamsPanel';
import HeadersPanel from './HeadersPanel';
import BodyPanel from './BodyPanel';
import AuthPanel from './AuthPanel';
import TestsPanel from './TestsPanel';

const active = (rows) => rows.filter((r) => r.enabled && r.key.trim()).length;

export default function RequestTabs({ req, update }) {
  const [tab, setTab] = useState('params');
  const tabs = [
    { id: 'params', label: 'Params', badge: active(req.params) || null },
    { id: 'headers', label: 'Headers', badge: active(req.headers) || null },
    { id: 'body', label: 'Body', badge: req.body.type !== 'none' ? '•' : null },
    { id: 'auth', label: 'Authentication', badge: req.auth.type !== 'none' ? '•' : null },
    { id: 'tests', label: 'Tests', badge: req.tests.length || null },
  ];
  return (
    <div className="req-tabs">
      <Tabs tabs={tabs} value={tab} onChange={setTab} label="Request configuration" />
      <div className="req-tab-body">
        <TabPanel id="params" value={tab}><ParamsPanel req={req} update={update} /></TabPanel>
        <TabPanel id="headers" value={tab}><HeadersPanel req={req} update={update} /></TabPanel>
        <TabPanel id="body" value={tab}><BodyPanel req={req} update={update} /></TabPanel>
        <TabPanel id="auth" value={tab}><AuthPanel req={req} update={update} /></TabPanel>
        <TabPanel id="tests" value={tab}><TestsPanel req={req} update={update} /></TabPanel>
      </div>
    </div>
  );
}
