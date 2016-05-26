var mapkey = '';
var maphostname = location.hostname;

switch(maphostname) {
	case 'localhost':
        		maykey = 'key=Evs0z2OaYLDO8e3sl8HwK7MwiS66Y@7Yqo-K$eeRwRQkxqrbO$';
        	break;
    	case 'ubeam.demo.taxi-beam.com':
        		maykey = 'key=NM7SZ26ZV$jN6Ed8-TJ2@dx4cXXOuj9H9rrD5OOgU4Fh4hSavu';
        	break;    	
    	case 'lite.taxi-beam.com':
    		maykey = 'key=wi69PDxOI48nsUnEo$BfKZzo$DbRxc6IZZYd@gLOpKbpV8eSui';
    	break;
    	default:
        		maykey = 'key=Evs0z2OaYLDO8e3sl8HwK7MwiS66Y@7Yqo-K$eeRwRQkxqrbO$';
} 

document.write('<script src="https://nhmap.ecartmap.com/v1_2/?'+maykey+'"></script>');