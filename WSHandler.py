import json

import tornado

import views


class WSHandler(tornado.websocket.WebSocketHandler):
    users = []

    def open(self):
        print('new connection')
        WSHandler.users.append(self)
        self.write_message('I got you!')

    def on_message(self, message):
        print('message received:  %s' % message)
        # self.check_message(message)
        # Reverse Message and send it back
        # print 'sending back message: %s' % message[::-1]
        # self.write_message(message[::-1])

    def on_close(self):
        print('connection closed')
        # self.user_logout()
        # WSHandler.users.remove(self)

    def check_origin(self, origin):
        host = self.request.headers.get('Host')
        print(host)
        print(origin)
        return True
