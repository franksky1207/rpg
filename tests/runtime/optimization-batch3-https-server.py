import http.server,ssl,subprocess,sys,urllib.parse
from pathlib import Path
port=int(sys.argv[1]);baseline=len(sys.argv)>2
class Handler(http.server.SimpleHTTPRequestHandler):
 def do_GET(self):
  name=urllib.parse.urlparse(self.path).path.lstrip('/')
  if baseline and name in ('resource-cache-client.js','resource-cache-sw.js'):
   data=subprocess.check_output(['git','show','9e9ed6292499fd5546842bb8ee55384fcde0bb1e:'+name]);self.send_response(200);self.send_header('Content-Type','text/javascript');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data);return
  super().do_GET()
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',port),Handler)
c=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER);c.load_cert_chain('work/batch3/cert.pem','work/batch3/key.pem');server.socket=c.wrap_socket(server.socket,server_side=True);server.serve_forever()
