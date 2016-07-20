import tornado


class PvpWSHandler(tornado.websocket.WebSocketHandler):
    clients = set()

    def open(self):
        print('new connection')
        PvpWSHandler.clients.add(self)

    def on_message(self, message):
        print('message received:  %s' % message)
        PvpWSHandler.manager.check_message(self, message)

    def on_close(self):
        print('connection closed')
        PvpWSHandler.clients.remove(self)

    def check_origin(self, origin):
        # host = self.request.headers.get('Host')
        # print(host)
        # print(origin)
        return True