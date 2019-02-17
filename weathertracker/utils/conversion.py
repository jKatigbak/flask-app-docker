import json
import os
from dateutil.parser import parse
from werkzeug.exceptions import abort


class DatetimeConversionException(Exception):
    pass

# TODO ensure data is only in memory
data_store = []

def normalize(data):
    d = {}
    try:

        for key, value in data.items():
            if key != "timestamp":
                if ensure_float(value):
                    d[key] = round(float(value), 1)
                elif value is None:
                    d[key] = ''
                else:
                    abort(status=400)
            elif key == "timestamp":
                d[key] = value

    except ValueError:
        abort(status=400)
    return d

def convert_to_datetime(value):
    try:
        value = parse(value)

    except (ValueError, OverflowError):
        raise DatetimeConversionException()

    return value


def ensure_float(f):
    try:
        v = float(f)
        return True

    except (ValueError, TypeError):
        return False


def get_datastore():

    return data_store





