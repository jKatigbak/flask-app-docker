import json
import os
from dateutil.parser import parse


package_dir = os.path.dirname(os.path.abspath(__file__))
DATA_STORE = os.path.join(package_dir, '../datastore/testdata.json')

class DatetimeConversionException(Exception):
    pass


def convert_to_datetime(value):
    try:
        value = parse(value)

    except (ValueError, OverflowError):
        raise DatetimeConversionException()

    return value


#TODO: #5 ensure value is float
def ensure_float(f):
    try:
        v = float(f)
        return True

    except ValueError:
        return False



def get_datastore():
    with open(DATA_STORE) as json_file:
        json_data = json.load(json_file)
        data = json_data["data"]
    return data




