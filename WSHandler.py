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
            del WSHandler.users[WSHandler.users[conn][0]]
        except:
            pass

    def check_message(self, conn, message):
        try:
            message = json.loads(message)
        except:
            pass
        finally:
            if 'nick' in message and 'ts' in message:
                WSHandler.users[message['nick']] = conn
                WSHandler.users[conn] = (message['nick'], message['ts'])


class WSHandler(tornado.websocket.WebSocketHandler):
    users = dict()
    clients = set()
    manager = UserManager()

    def open(self):
        print('new connection')
        WSHandler.clients.add(self)
        self.write_message('I got you!')

    def on_message(self, message):
        print('message received:  %s' % message)
        WSHandler.manager.check_message(self, message)
        # Reverse Message and send it back

    def on_close(self):
        print('connection closed')
        WSHandler.clients.remove(self)
        WSHandler.manager.logout(self)

    def check_origin(self, origin):
        # host = self.request.headers.get('Host')
        # print(host)
        # print(origin)
        return True
