- Le "riproduzioni" delle tracce non esistono nell'API di Deezer. Si dovrà sostituire con "rank".

- Il "numero di ascoltatori mensilI" dell'artista non esistono nell'API di Deezer. Si dovrà sostituire con "numero di fan".

## albumId -> album_id

nuova convenzione, ad esempio:

albumId -> album_id
artistId -> artist_id

per motivi particolari che riguardano il modo in cui i browser trattano certi file (possono trattare in modo imprevedibile le maiuscole e le minuscole), i parametri nella query string li faremo con questa struttura:
tutto minuscolo
spazi separati da underscore
