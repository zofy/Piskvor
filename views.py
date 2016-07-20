import json

import time
import tornado
from tornado import gen
from tornado.httpclient import AsyncHTTPClient

from IndexWSHandler import IndexWSHandler


class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("user")

    @tornado.web.authenticated
    def get(self):
        self.write(json.dumps({'nick': tornado.escape.xhtml_escape(self.current_user),
                               'ts': tornado.escape.xhtml_escape(self.get_secure_cookie("timestamp"))}))


class UserHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.write(json.dumps({'users': [user for user in IndexWSHandler.users if
                                         user != tornado.escape.xhtml_escape(self.current_user)]}))


class GameHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        self.render("game.html")


class IndexHandler(BaseHandler):
    @tornado.web.authenticated
    def get(self):
        name, timestamp = tornado.escape.xhtml_escape(self.current_user), tornado.escape.xhtml_escape(
            self.get_secure_cookie("timestamp"))
        if name in IndexWSHandler.users and IndexWSHandler.conns[IndexWSHandler.users[name]][1] != timestamp:
            self.clear_cookie("user")
            self.redirect("/")
        else:
            self.render("index.html")


class LoginHandler(BaseHandler):
    def get(self):
        self.clear_cookie("user")
        self.clear_cookie("timestamp")
        self.render("login.html")

    def post(self):
        self.set_secure_cookie("user", self.get_argument("nick"))
        self.set_secure_cookie("timestamp", str(time.time()))
        self.redirect('/')


class LogoutHandler(BaseHandler):
    def get(self):
        self.clear_cookie("user")
        self.clear_cookie("timestamp")
        self.redirect("/")
