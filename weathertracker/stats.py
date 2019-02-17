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
        vals = [v[m] for v in values if m in v.keys() and v[m] != '']
        for s in stats:
            print(m, s, vals)
            if s in choices:
                try:
                    action = None
                    if is_avg(s, vals):
                        action = round(float(get_avg(m, s, vals)), 1)

                    elif is_max(s):
                        action = get_max(vals)

                    elif is_min(s):
                        action = get_min(vals)
                    if action is not None:
                        response_data.append({"metric": m, "stat": s, "value": action})

                except(ValueError, TypeError):
                    pass

    return Response(json.dumps(response_data), status=200)
