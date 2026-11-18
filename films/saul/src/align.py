"""Align script_lines.txt to narration.mp3, snapping every line to a real onset.

The voice track is the master clock. Each line must begin where speech actually
begins, so this groups the detected speech spans into one group per line and
takes that group's first onset as the line's start time.

Why not ration speech time proportionally (the first version of this script, in
films/nathan-david): handing each line a syllable-weighted QUANTITY of speech
makes a line's start the running total of everything before it, not an observed
onset. Every short estimate pushes the remainder late and the error only
accumulates, which showed on screen as transitions lagging the voice. Syllable
counts also under-weight emphatic short lines a narrator stretches, so the drift
ran late in particular. Snapping to onsets cannot drift: a bad estimate costs
at most one span boundary and the next line re-anchors to measured audio.
"""
import io, os, re, json, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
MP3 = os.path.join(HERE, 'narration.mp3')
LINES = os.path.join(HERE, 'script_lines.txt')
OUT = os.path.join(HERE, 'aligned.json')

NOISE, MINSIL, MINSPAN = '-35dB', 0.25, 0.12


def duration(path):
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
         '-of', 'csv=p=0', path],
        capture_output=True, text=True, check=True).stdout
    return float(out.strip())


def speech_regions(path, total):
    """Invert the detected silences into (start, end) speech spans."""
    p = subprocess.run(
        ['ffmpeg', '-hide_banner', '-nostats', '-i', path,
         '-af', 'silencedetect=noise=%s:d=%s' % (NOISE, MINSIL), '-f', 'null', '-'],
        capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', p.stderr)]
    ends = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', p.stderr)]
    if len(ends) < len(starts):          # track ends inside a silence
        ends.append(total)

    spans, cur = [], 0.0
    for s, e in zip(starts, ends):
        if s > cur:
            spans.append((cur, s))
        cur = e
    if cur < total:
        spans.append((cur, total))
    return [(a, b) for a, b in spans if b - a > MINSPAN]


def syllables(text):
    """Rough syllable count - used only to decide how spans group, never to
    compute a start time."""
    n = 0
    for w in re.findall(r"[a-z']+", text.lower()):
        c = len(re.findall(r'[aeiouy]+', w))
        if w.endswith('e') and c > 1 and not w.endswith(('le', 'ee', 'ye')):
            c -= 1
        n += max(1, c)
    return max(1, n)


def group_spans(spans, weights):
    """Assign every span to a line, keeping both in order.

    Dynamic programming over (span, line): each line takes at least one span,
    and the cost of a grouping is how far each line's measured speech lands
    from its syllable-weighted expectation. Minimising total cost puts the
    boundaries where the audio agrees with the script, and because each line
    then starts at a span onset, nothing can accumulate.
    """
    n, m = len(spans), len(weights)
    if n < m:
        raise SystemExit(
            'only %d speech spans for %d lines - the narration cannot contain '
            'this script, or silencedetect is mis-tuned' % (n, m))

    dur = [b - a for a, b in spans]
    pre = [0.0]
    for d in dur:
        pre.append(pre[-1] + d)
    speech = pre[-1]
    wsum = float(sum(weights))
    want = [w / wsum * speech for w in weights]

    INF = float('inf')
    # cost[i][j] = best cost covering spans[:i] with lines[:j]
    cost = [[INF] * (m + 1) for _ in range(n + 1)]
    back = [[-1] * (m + 1) for _ in range(n + 1)]
    cost[0][0] = 0.0
    for j in range(1, m + 1):
        for i in range(j, n - (m - j) + 1):
            best, bk = INF, -1
            for k in range(j - 1, i):          # line j covers spans[k:i]
                if cost[k][j - 1] == INF:
                    continue
                got = pre[i] - pre[k]
                c = cost[k][j - 1] + abs(got - want[j - 1])
                if c < best:
                    best, bk = c, k
            cost[i][j], back[i][j] = best, bk

    bounds, i = [n], n
    for j in range(m, 0, -1):
        i = back[i][j]
        bounds.append(i)
    bounds.reverse()
    return [(bounds[j], bounds[j + 1]) for j in range(m)]


def main():
    total = duration(MP3)
    spans = speech_regions(MP3, total)

    lines = []
    for raw in io.open(LINES, encoding='utf-8'):
        raw = raw.strip()
        if raw and '|' in raw:
            spk, text = raw.split('|', 1)
            lines.append((spk.strip(), text.strip()))

    weights = [syllables(t) for _, t in lines]
    groups = group_spans(spans, weights)

    out = []
    for i, (spk, text) in enumerate(lines):
        lo, hi = groups[i]
        t = spans[lo][0]                       # measured onset, never a sum
        # The line owns the pause after it, up to the next line's onset.
        nxt = spans[groups[i + 1][0]][0] if i + 1 < len(lines) else total
        out.append({'spk': spk, 'text': text,
                    't': round(t, 2), 'd': round(max(0.4, nxt - t), 2),
                    'spans': hi - lo, 'said': round(spans[hi - 1][1] - t, 2)})

    io.open(OUT, 'w', encoding='utf-8').write(json.dumps(out, indent=1))
    speech = sum(b - a for a, b in spans)
    print('track %.2fs  speech %.2fs in %d spans / %d lines'
          % (total, speech, len(spans), len(out)))
    print('last line ends %.2fs' % (out[-1]['t'] + out[-1]['d']))
    worst = max(out, key=lambda o: o['d'] - o['said'])
    print('longest trailing pause: %.2fs after %s "%s"'
          % (worst['d'] - worst['said'], worst['spk'], worst['text'][:46]))


if __name__ == '__main__':
    main()
