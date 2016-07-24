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
        if PvpWSHandler.pending[user] in PvpWSHandler.users:
            # stop periodic task
            tornado.ioloop.PeriodicCallback(lambda: self.check_connection(user), 100).stop()
            if PvpWSHandler.pending[user] not in PvpWSHandler.couples:
                opponent = PvpWSHandler.pending[user]
                PvpWSHandler.couples[user] = opponent
                PvpWSHandler.couples[opponent] = user
                PvpWSHandler.users[user].write_message(json.dumps({'connection': 1}))

                # poslat spravu o zacati hry

    def end_checking(self, user):
        print("End checking user: " + user)
        # if tornado.ioloop.PeriodicCallback(lambda: self.check_connection(user), 100).is_running():
        #     tornado.ioloop.PeriodicCallback(lambda: self.check_connection(user), 100).stop()
        # self.remove_pending(user)
        if user not in PvpWSHandler.couples:
            PvpWSHandler.users[user].write_message(json.dumps({'connection': 0}))
            # send message to redirect / nedoslo k spojeniu

    def check_json(self, conn, json):
        if 'nick' in json:
            PvpWSHandler.users[json['nick']] = conn
            PvpWSHandler.conns[conn] = json['nick']
            # start periodic callback
            # tornado.ioloop.PeriodicCallback(lambda: self.check_connection(json['nick']), 100).start()
            tornado.ioloop.IOLoop.instance().add_timeout(datetime.timedelta(seconds=3),
                                                         lambda: self.end_checking(json['nick']))

    def check_message(self, conn, message):
        try:
            message = json.loads(message)
        except:
            pass
        else:
            self.check_json(conn, message)

    def remove_pending(self, user):
        print('testing...')
        if user not in PvpWSHandler.users:
            print("Removing pending")
            print("is pendning %s" % (user in PvpWSHandler.pending))
            try:
                del PvpWSHandler.pending[user]
                print(PvpWSHandler.pending)
            except:
                pass

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
        tornado.ioloop.IOLoop.instance().add_timeout(datetime.timedelta(seconds=5),
                                                     lambda: self.manager.remove_pending(user))

    def check_origin(self, origin):
        # host = self.request.headers.get('Host')
        # print(host)
        # print(origin)
        return True
