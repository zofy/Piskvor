import json
import tornado


class UserManager(object):
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(UserManager, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def logout(self, conn):
        try:
            del IndexWSHandler.users[IndexWSHandler.conns[conn][0]]
            del IndexWSHandler.conns[conn]
        except:
            pass

    def check_json(self, conn, json):
        if 'nick' in json and 'ts' in json:
            IndexWSHandler.users[json['nick']] = conn
            IndexWSHandler.conns[conn] = (json['nick'], json['ts'])

    def send_refresh(self):
        print('Sending refresh...')
        for user in IndexWSHandler.clients:
            user.write_message('refresh')

    def check_message(self, conn, message):
        try:
            message = json.loads(message)
        except:
            pass
        else:
            self.check_json(conn, message)


class IndexWSHandler(tornado.websocket.WebSocketHandler):
    users = dict()
    conns = dict()
    clients = set()
    manager = UserManager()

    def open(self):
        print('new connection')
        IndexWSHandler.clients.add(self)

    def on_message(self, message):
        print('message received:  %s' % message)
        IndexWSHandler.manager.check_message(self, message)
        IndexWSHandler.manager.send_refresh()

    def on_close(self):
        print('connection closed')
        IndexWSHandler.clients.remove(self)
        IndexWSHandler.manager.logout(self)
        IndexWSHandler.manager.send_refresh()

    def check_origin(self, origin):
        # host = self.request.headers.get('Host')
        # print(host)
        # print(origin)
        return True
