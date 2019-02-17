from flask import Response, abort
from weathertracker.utils.conversion import get_datastore
import json
from functools import reduce


def get_stats(stats, metrics, from_datetime, to_datetime):
    choices = {u'min',
               u'max',
               u'average'}

    data = get_datastore()

    if len(data) == 0:
        abort(status=400)

    values = []
    for d in data:
        time = d["timestamp"]
        start = str(from_datetime.isoformat())
        end = str(to_datetime.isoformat())

        # https://fits.gsfc.nasa.gov/iso-time.html
        if start <= time < end:
            values.append(d)

    response_data = []

    get_min = lambda x: min(x)
    get_max = lambda y: max(y)
    get_avg = lambda x, y, z: reduce(lambda a, b: a + b, z) / len(z)

    is_min = lambda c: c == u'min'
    is_max = lambda c: c == u'max'
    is_avg = lambda c, l: c == u'average' and len(l) > 1

    for m in metrics:
        valid_values = [v[m] for v in values if m in v.keys() and v[m] != '']
        for s in stats:
            if s in choices:
                try:
                    result = None
                    if is_avg(s, valid_values):
                        result = round(float(get_avg(m, s, valid_values)), 1)

                    elif is_max(s):
                        result = get_max(valid_values)

                    elif is_min(s):
                        result = get_min(valid_values)
                    if result is not None:
                        response_data.append({"metric": m, "stat": s, "value": result})

                except(ValueError, TypeError):
                    pass

    return Response(json.dumps(response_data), status=200)
