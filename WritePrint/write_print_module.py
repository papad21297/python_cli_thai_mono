class WritePrintClass:
    def __init__(self):
        with open(
            'render_propo_to_grid\\source_text_file\\ref.txt',
            'w',
            encoding='utf-8'
        ) as writefile:
            writefile.write('')
    def out(text, end='\n'):
        with open(
            'render_propo_to_grid\\source_text_file\\ref.txt',
            'a',
            encoding='utf-8'
        ) as appendfile:
            appendfile.write(str(text) + end)