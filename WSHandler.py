import tornado


class WSHandler(tornado.websocket.WebSocketHandler):
    clients = []

    def open(self):
        print('new connection')
        WSHandler.clients.append(self)

    def on_message(self, message):
        print('message received:  %s' % message)
        # self.check_message(message)
        # Reverse Message and send it back
        # print 'sending back message: %s' % message[::-1]
        # self.write_message(message[::-1])

    def on_close(self):
        print('connection closed')
        # self.user_logout()
        WSHandler.clients.remove(self)

    def check_origin(self, origin):
        host = self.request.headers.get('Host')
        print(host)
        print(origin)
        return True
