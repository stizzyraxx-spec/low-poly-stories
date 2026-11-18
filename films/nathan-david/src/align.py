"""Align script_lines.txt to narration.mp3.

The voice track is the master clock, so each line has to claim the stretch of
audio where it is actually spoken. Silence detection gives the speech regions;
each line then takes a share of that speech proportional to its syllable count,
which tracks speaking time far better than character count does.
"""
import io, os, re, json, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
MP3 = os.path.join(HERE, 'narration.mp3')
LINES = os.path.join(HERE, 'script_lines.txt')
OUT = os.path.join(HERE, 'aligned.json')

NOISE, MINSIL = '-35dB', 0.25


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
    log = p.stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', log)]
    ends = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', log)]
    if len(ends) < len(starts):          # track ends inside a silence
        ends.append(total)

    spans, cur = [], 0.0
    for s, e in zip(starts, ends):
        if s > cur:
            spans.append((cur, s))
        cur = e
    if cur < total:
        spans.append((cur, total))
    return [(a, b) for a, b in spans if b - a > 0.08]


def syllables(text):
    """Rough syllable count - good enough to weight relative speaking time."""
    n = 0
    for w in re.findall(r"[a-z']+", text.lower()):
        groups = re.findall(r'[aeiouy]+', w)
        c = len(groups)
        if w.endswith('e') and c > 1 and not w.endswith(('le', 'ee', 'ye')):
            c -= 1
        n += max(1, c)
    return max(1, n)


def main():
    total = duration(MP3)
    spans = speech_regions(MP3, total)
    speech = sum(b - a for a, b in spans)

    lines = []
    for raw in io.open(LINES, encoding='utf-8'):
        raw = raw.strip()
        if not raw or '|' not in raw:
            continue
        spk, text = raw.split('|', 1)
        lines.append((spk.strip(), text.strip()))

    weights = [syllables(t) for _, t in lines]
    wsum = float(sum(weights))

    # Walk the speech spans, handing each line its syllable-weighted share.
    # A line's clock time runs from where it starts speaking to where the next
    # line starts, so pauses belong to the line that precedes them.
    want = [w / wsum * speech for w in weights]
    starts_at, si, used = [], 0, 0.0
    for need in want:
        if si >= len(spans):
            starts_at.append(spans[-1][1])
            continue
        starts_at.append(spans[si][0] + used)
        left = need
        while left > 1e-9 and si < len(spans):
            avail = (spans[si][1] - spans[si][0]) - used
            if avail > left:
                used += left
                left = 0
            else:
                left -= avail
                si += 1
                used = 0.0

    out = []
    for i, (spk, text) in enumerate(lines):
        t = round(starts_at[i], 2)
        nxt = starts_at[i + 1] if i + 1 < len(lines) else total
        out.append({'spk': spk, 'text': text, 't': t, 'd': round(max(0.4, nxt - t), 2)})

    io.open(OUT, 'w', encoding='utf-8').write(json.dumps(out, indent=1))
    last = out[-1]
    print('track %.2fs  speech %.2fs in %d spans' % (total, speech, len(spans)))
    print('%d lines, last ends %.2fs' % (len(out), last['t'] + last['d']))


if __name__ == '__main__':
    main()
