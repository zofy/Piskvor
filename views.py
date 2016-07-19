import json

import time
import tornado
from tornado import gen
from tornado.httpclient import AsyncHTTPClient

from WSHandler import WSHandler


class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("user")


class UserHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.write(json.dumps({'nick': tornado.escape.xhtml_escape(self.current_user),
                               'ts': tornado.escape.xhtml_escape(self.get_secure_cookie("timestamp"))}))


class GameHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.render("game.html")


class MenuHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        name, timestamp = tornado.escape.xhtml_escape(self.current_user), tornado.escape.xhtml_escape(
            self.get_secure_cookie("timestamp"))
        if name in WSHandler.users and WSHandler.conns[WSHandler.users[name]][1] != timestamp:
            self.clear_cookie("user")
            self.redirect("/")
        else:
            self.render("game.html")


class LoginHandler(BaseHandler):
    def get(self):
        self.clear_cookie("user")
        self.render("index.html")

    def post(self):
        self.set_secure_cookie("user", self.get_argument("nick"))
        self.set_secure_cookie("timestamp", str(time.time()))
        print("Your ts is: " + str(self.get_secure_cookie("timestamp")))
        self.redirect('/')


class LogoutHandler(BaseHandler):
    def get(self):
        self.clear_cookie("user")
        self.redirect("/")
