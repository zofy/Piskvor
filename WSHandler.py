import json
import tornado

from coroutine import coroutine


# class MenuManager(object):
#     _instance = None
#
#     def __new__(cls, *args, **kwargs):
#         if not cls._instance:
#             cls._instance = super(UserManager, cls).__new__(cls, *args, **kwargs)
#         return cls._instance
#
#     def follow(self, on_call, target):
#         thefile.seek(0, 2)  # Go to the end of the file
#         while True:
#             line = thefile.readline()
#             if not line:
#                 time.sleep(0.1)  # Sleep briefly
#                 continue
#             target.send(line)
#
#     @coroutine
#     @classmethod
#     def broadcast(cls):
#         while True:
#             item = (yield)
#             for target in WSHandler.on_call:
#                 target.send(item)


class UserManager(object):
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(UserManager, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def logout(self, conn):
        try:
            WSHandler.on_call.remove(conn)
            del WSHandler.users[WSHandler.conns[conn][0]]
            del WSHandler.conns[conn]
        except:
            pass

    def check_json(self, conn, json):
        if 'nick' in json and 'ts' in json:
            WSHandler.users[json['nick']] = conn
            WSHandler.conns[conn] = (json['nick'], json['ts'])
        elif 'menu' in json:
            WSHandler.on_call.add(conn)
            self.send_refresh()

    def send_refresh(self):
        print('Sending refresh...')
        for user in WSHandler.on_call:
            user.write_message('refresh')

    def check_message(self, conn, message):
        try:
            message = json.loads(message)
        except:
            pass
        else:
            self.check_json(conn, message)


class WSHandler(tornado.websocket.WebSocketHandler):
    users = dict()
    conns = dict()
    clients = set()
    on_call = set()
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
