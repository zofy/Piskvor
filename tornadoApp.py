import logging
import socket
import os

import signal
import tornado.httpserver
import tornado.websocket
import tornado.ioloop
import tornado.web

from tornado.options import options

from WSHandler import WSHandler
from views import LoginHandler, GameHandler

is_closing = False

BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Piskvor')


def signal_handler(signum, frame):
    global is_closing
    logging.info('exiting...')
    is_closing = True


def try_exit():
    global is_closing
    if is_closing:
        tornado.ioloop.IOLoop.instance().stop()
        logging.info('exit success')


class Application(tornado.web.Application):

    def __init__(self):
        handlers = [
            (r"/", GameHandler),
            (r"/login", LoginHandler),
            (r'/ws', WSHandler),
        ]
        settings = {
            "cookie_secret": "__BIG_CITY_LIFE__",
            "login_url": "/login",
            "xsrf_cookies": True,
            "debug": True,
            "template_path": os.path.join(BASE_DIR, "templates"),
            "static_path": os.path.join(BASE_DIR, "static")
        }
        tornado.web.Application.__init__(self, handlers, **settings)


if __name__ == "__main__":
    http_server = tornado.httpserver.HTTPServer(Application())
    tornado.options.parse_command_line()
    signal.signal(signal.SIGINT, signal_handler)
    http_server.listen(os.environ.get("PORT", 8000))
    myIP = socket.gethostbyname(socket.gethostname())
    print('*** TornadoApp started at %s***' % myIP)
    tornado.ioloop.PeriodicCallback(try_exit, 100).start()
    tornado.ioloop.IOLoop.instance().start()
