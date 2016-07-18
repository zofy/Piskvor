import json
import datetime

import tornado


def check_pending(name):
    if name in WSHandler.pending:
        print("Removing " + name + " from pending...")
        WSHandler.pending.remove(name)
        print(WSHandler.pending)


class WSHandler(tornado.websocket.WebSocketHandler):
    users = dict()
    clients = set()
    pending = set()

    def open(self):
        print('new connection')
        WSHandler.clients.add(self)
        self.write_message('I got you!')

    def on_message(self, message):
        print('message received:  %s' % message)
        self.check_message(json.loads(message))
        # Reverse Message and send it back

    def on_close(self):
        print('connection closed')
        # tornado.ioloop.IOLoop.instance().add_timeout(datetime.timedelta(seconds=5),
        #                                              check_pending, WSHandler.users[self])
        WSHandler.clients.remove(self)
        del WSHandler.users[WSHandler.users[self]]
        print(WSHandler.users[self] in WSHandler.users)

    def check_origin(self, origin):
        # host = self.request.headers.get('Host')
        # print(host)
        # print(origin)
        return True

    def check_message(self, message):
        if 'nick' in message:
            WSHandler.users[message['nick']] = self
            WSHandler.users[self] = message['nick']
            WSHandler.pending.add(WSHandler.users[self])
