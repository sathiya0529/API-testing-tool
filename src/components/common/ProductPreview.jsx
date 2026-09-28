import { MethodBadge } from '../ui/Badges';

// Static, decorative recreation of the workspace. Built from real markup, not an image.
export default function ProductPreview() {
  return (
    <div className="preview" aria-hidden="true">
      <div className="preview-side">
        <div className="preview-nav active">Collections</div>
        <div className="preview-tree"><span>User Management</span>
          <div><MethodBadge method="GET" /> Get Users</div><div><MethodBadge method="POST" /> Create User</div>
          <div><MethodBadge method="PUT" /> Update User</div><div><MethodBadge method="DELETE" /> Delete User</div>
        </div>
        <div className="preview-nav">History</div><div className="preview-nav">Environments</div><div className="preview-nav">Test Cases</div>
      </div>
      <div className="preview-main">
        <div className="preview-bar"><span className="preview-method">GET</span><span className="preview-url">https://api.example.com/users</span><span className="preview-send">Send</span></div>
        <div className="preview-stats">
          <div><small>Total Requests</small><b>248</b></div><div><small>Success Rate</small><b>94.8%</b></div>
          <div><small>Avg Response</small><b>214 ms</b></div><div><small>Failed</small><b>13</b></div>
        </div>
        <div className="preview-resp">
          <div className="row gap-8"><span className="pill pill-ok">200 OK</span><span className="pill">245 ms</span><span className="pill">1.2 KB</span><span className="pill pill-ok">3/3 tests passed</span></div>
          <pre className="preview-code">{`{\n  "users": [\n    { "id": 1, "name": "John Doe" },\n    { "id": 2, "name": "Jane Smith" }\n  ]\n}`}</pre>
        </div>
      </div>
    </div>
  );
}
