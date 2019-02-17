import json
import os
import dateutil
from flask import Response, abort
from weathertracker.utils.conversion import ensure_float, convert_to_datetime, get_datastore


package_dir = os.path.dirname(os.path.abspath(__file__))
data_store = os.path.join(package_dir, 'datastore/testdata.json')

# features/03-interview/03-accurate-reporting.feature
def normalize(data):
    d = {}
    try:

        for key, value in data.items():
            if key != "timestamp":
                if ensure_float(value):
                    d[key] = round(float(value), 1)
                else:
                    abort(status=400)
            elif key == "timestamp":
                d[key] = value

    except ValueError:
        abort(status=400)
    return d


def add_measurement(data):

    normalized = normalize(data)

    store = get_datastore()

    store.append(normalized)

    with open(data_store, "w") as json_file:
        json.dump({"data": store}, json_file)

    return Response(status=200, headers={"location":"/measurements/{}".format(normalized["timestamp"])})


def get_measurement(date):

    data = get_datastore()

    for d in data:
        time = dateutil.parser.parse(d["timestamp"]).isoformat()

        if time == str(date.isoformat()):
            return Response(json.dumps(d), status=201)

    return Response(status=404)


def query_measurements(start_date, end_date):

    data = get_datastore()

    start = str(start_date.isoformat())
    end = str(end_date.isoformat())

    response = []

    for d in data:
        time = dateutil.parser.parse(d["timestamp"]).isoformat()
        if start <= time < end:
            response.append(d)

    if len(response) == 0:
        return Response({}, 200)

    return Response(json.dumps(response), status=200)


