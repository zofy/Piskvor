import json
import tornado

from PvpWSHandler import PvpWSHandler


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
            self.send_refresh()
        elif 'proposal' in json:
            self.send_proposal(conn, json['proposal'])
        elif 'answer' in json:
            self.handle_answer(conn, json['opponent'], json['answer'])

    def send_proposal(self, conn, user):
        if user in IndexWSHandler.users:
            IndexWSHandler.users[user].write_message(
                json.dumps({'proposal': IndexWSHandler.conns[conn][0]}))

    def handle_answer(self, conn, user, answer):
        if user in IndexWSHandler.users:
            if answer > 0:
                PvpWSHandler.players[user] = IndexWSHandler.conns[conn][0]
                PvpWSHandler.players[IndexWSHandler.conns[conn][0]] = user
                conn.write_message(json.dumps({'play': 'let`s play'}))
            IndexWSHandler.users[user].write_message(
                json.dumps({'answer': IndexWSHandler.conns[conn][0]}))

    def send_refresh(self):
        print('Sending refresh...')
        for user in IndexWSHandler.conns:
            user.write_message(json.dumps({'refresh': 'refresh'}))

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
    manager = UserManager()

    def open(self):
        print('new connection')

    def on_message(self, message):
        print('message received:  %s' % message)
        IndexWSHandler.manager.check_message(self, message)

    def on_close(self):
        print('connection closed')
        IndexWSHandler.manager.logout(self)
        IndexWSHandler.manager.send_refresh()

    def check_origin(self, origin):
        # host = self.request.headers.get('Host')
        # print(host)
        # print(origin)
        return True
