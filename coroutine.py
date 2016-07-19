def coroutine(func):
    def start(*args, **kwargs):
        cr = func(*args, **kwargs)
        cr.__next__()
        return cr

    return start
