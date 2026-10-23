"""Package already-rendered files; no image manipulation."""
import json, pathlib, sys, zipfile
directory = pathlib.Path(sys.argv[1])
specs = json.loads((directory / 'archive-spec.json').read_text())
for spec in specs:
    if len(sys.argv) > 2 and sys.argv[2] not in spec['filename']:
        continue
    destination = directory.parent / spec['filename']
    with zipfile.ZipFile(destination, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        archive.writestr('index.html', spec['html'])
        archive.writestr('measurements.csv', spec['csv'])
        archive.write(directory / 'README.md', 'README.md')
        for screen in spec['screens']:
            for source in (directory / screen).iterdir():
                if source.is_file():
                    archive.write(source, str(source.relative_to(directory)))
        if spec['components']:
            for source in (directory / 'components').iterdir():
                if source.is_file():
                    archive.write(source, str(source.relative_to(directory)))
    size = destination.stat().st_size
    print(f'{destination.name}: {size:,} bytes')
    if size > 95 * 1024 * 1024:
        raise SystemExit('Archive exceeds conservative GitHub file size limit')
