#!/usr/bin/env python3
"""Read-only timing report. Sum job lifetimes, not workflow wall time, for runner usage."""
import datetime
import json
import subprocess
import sys


def api(path):
    return json.loads(subprocess.check_output(['gh', 'api', path]))


def seconds(start, end):
    if not start or not end:
        return None
    return (datetime.datetime.fromisoformat(end.replace('Z', '+00:00')) -
            datetime.datetime.fromisoformat(start.replace('Z', '+00:00'))).total_seconds()


reports = []
for run_id in sys.argv[1:]:
    base = f'repos/franksky1207/rpg/actions/runs/{int(run_id)}'
    run = api(base)
    jobs = api(base + '/jobs?per_page=100')['jobs']
    assert len(jobs) < 100, 'Paginate before reporting more than 99 jobs'
    rows = []
    for job in jobs:
        rows.append(dict(name=job['name'], id=job['id'], conclusion=job['conclusion'],
                         seconds=seconds(job['started_at'], job['completed_at']),
                         steps=[dict(name=s['name'], conclusion=s['conclusion'],
                                     seconds=seconds(s.get('started_at'), s.get('completed_at')))
                                for s in job['steps']]))
    reports.append(dict(id=int(run_id), url=run['html_url'], name=run['name'], sha=run['head_sha'],
                        event=run['event'], attempt=run['run_attempt'], conclusion=run['conclusion'],
                        wall_seconds=seconds(run['run_started_at'], run['updated_at']),
                        runner_minutes=sum(j['seconds'] or 0 for j in rows) / 60,
                        jobs=rows))
print(json.dumps(reports, ensure_ascii=False, indent=2))
