import datetime
import json

import tornado
from tornado.ioloop import PeriodicCallback


class PlayerManager(object):
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(PlayerManager, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def check_connection(self, user):
        print('checking...')
        if PvpWSHandler.pending[user] in PvpWSHandler.users:
            if PvpWSHandler.pending[user] not in PvpWSHandler.couples:
                opponent = PvpWSHandler.pending[user]
                PvpWSHandler.couples[user] = opponent
                PvpWSHandler.couples[opponent] = user
                PvpWSHandler.users[user].write_message(json.dumps({'connection': 1, 'begin': 0}))
                PvpWSHandler.users[opponent].write_message(json.dumps({'connection': 1, 'begin': 1}))

                # poslat spravu o zacati hry

    def end_checking(self, user):
        self.check_connection(user)
        print("End checking user: " + user)
        if user not in PvpWSHandler.couples:
            PvpWSHandler.users[user].write_message(json.dumps({'connection': 0}))
            # send message to redirect / nedoslo k spojeniu

    def handle_game(self, conn, point):
        me = PvpWSHandler.conns[conn]
        if PvpWSHandler.couples[me] not in PvpWSHandler.users:
            conn.write_message("connection lost")
        else:
            opponent = PvpWSHandler.couples[me]
            PvpWSHandler.users[opponent].write_message("sending point" + point)

    def check_json(self, conn, json):
        if 'nick' in json:
            PvpWSHandler.users[json['nick']] = conn
            PvpWSHandler.conns[conn] = json['nick']
            tornado.ioloop.IOLoop.instance().add_timeout(datetime.timedelta(seconds=2),
                                                         lambda: self.end_checking(json['nick']))
        elif 'point' in json:
            self.handle_game(conn, json['point'])

    def check_message(self, conn, message):
        try:
            message = json.loads(message)
        except:
            pass
        else:
            self.check_json(conn, message)

    def remove_pending(self, user):
        if user not in PvpWSHandler.users:
            try:
                print("Removing pending...")
                print("is pending %s" % (user in PvpWSHandler.pending))
                del PvpWSHandler.pending[user]
                print(PvpWSHandler.pending)
            except:
                pass

    def remove_couple(self, user):
        if user not in PvpWSHandler.users:
            try:
                print("Removing couple...")
                opponent = PvpWSHandler.couples[user]
                if opponent in PvpWSHandler.users:
                    PvpWSHandler.users[opponent].write_message('connection lost')
                del PvpWSHandler.couples[user]
                del PvpWSHandler.couples[PvpWSHandler.pending[user]]
                print(PvpWSHandler.couples)
            except:
                pass

    def try_logout(self, user):
        print('testing...')
        self.remove_couple(user)
        self.remove_pending(user)

    def logout(self, conn):
        try:
            del PvpWSHandler.users[PvpWSHandler.conns[conn]]
            del PvpWSHandler.conns[conn]
        except:
            pass


class PvpWSHandler(tornado.websocket.WebSocketHandler):
    pending = dict()
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
        user = PvpWSHandler.conns[self]
        PvpWSHandler.manager.logout(self)
        tornado.ioloop.IOLoop.instance().add_timeout(datetime.timedelta(seconds=4),
                                                     lambda: self.manager.try_logout(user))

    def check_origin(self, origin):
        # host = self.request.headers.get('Host')
        # print(host)
        # print(origin)
        return True
