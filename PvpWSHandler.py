import datetime
import json

import tornado


class PlayerManager(object):
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(PlayerManager, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def check_connection(self, user):
        # check whether in couples
        if PvpWSHandler.players[user] in PvpWSHandler.users:
            # stop periodic task
            opponent = PvpWSHandler.players[user]
            PvpWSHandler.couples[user] = opponent
            PvpWSHandler.couples[opponent] = user

    def end_checking(self, user):
        pass
        # send message to redirect if user not connected
        # stop periodic checking

    def check_json(self, conn, json):
        if 'nick' in json:
            PvpWSHandler.users[json['nick']] = conn
            PvpWSHandler.conns[conn] = json['nick']
            # start periodic callback
            tornado.ioloop.IOLoop.instance().add_timeout(datetime.timedelta(seconds=5),
                                                         self.end_checking(json['nick']))

    def check_message(self, conn, message):
        try:
            message = json.loads(message)
        except:
            pass
        else:
            self.check_json(conn, message)

    def logout(self, conn):
        try:
            del PvpWSHandler.players[PvpWSHandler.conns[conn]]
            del PvpWSHandler.users[PvpWSHandler.conns[conn]]
            del PvpWSHandler.conns[conn]
        except:
            pass


class PvpWSHandler(tornado.websocket.WebSocketHandler):
    players = dict()
    users = dict()
    conns = dict()
    couples = dict()
    manager = PlayerManager()

    def open(self):
        print('new connection')

    def on_message(self, message):
        print('message received:  %s' % message)
        PvpWSHandler.manager.check_message(self, message)

    def on_close(self):
        print('connection closed')
        PvpWSHandler.manager.logout(self)

    def check_origin(self, origin):
        # host = self.request.headers.get('Host')
        # print(host)
        # print(origin)
        return True
