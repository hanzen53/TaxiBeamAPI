var mapkey = '';
var maphostname = location.hostname;

switch(maphostname) {
    
        case 'localhost':
            mapkey = 'Evs0z2OaYLDO8e3sl8HwK7MwiS66Y@7Yqo-K$eeRwRQkxqrbO$';
        break;

        case 'ubeam.demo.taxi-beam.com':
            mapkey = 'NM7SZ26ZV$jN6Ed8-TJ2@dx4cXXOuj9H9rrD5OOgU4Fh4hSavu';
        break;      

        case 'lite.taxi-beam.com':
            mapkey = 'wi69PDxOI48nsUnEo$BfKZzo$DbRxc6IZZYd@gLOpKbpV8eSui';
        break;

        case 'lite-dev.taxi-beam.com':
            mapkey = 'jcMwkY50Yu1aTMTtKL-7B0sK4PcaaSEXbXVHHE--1swEThFfoo';
        break;

        case 'dispatcher-dev.taxi-beam.com':
            mapkey = 'XpIj4K0fKUHHRVO4LB04XHsRnXwvPMK3wyptxgKCG17YSn0QHq';
        break;

        case 'web-dev.taxi-beam.com':
            mapkey = '5@98Q8zakZG6Cg65Wvt09Xpts0IynuwxJqjZDFO9Abp@$-NJsy';
        break;

        case 'lite-test.taxi-beam.com':
            mapkey = 'jXZ5Zzuyi_PyF6fUwB7yeyfv@EQNZ7V2yNJqNjUC6TfNGwdACj';
        break;

        case 'dispatcher-test.taxi-beam.com':
            mapkey = 'Sw34ArtWhv1x3rdAmRBCW5d7JyB7q_yMkTJzgF6jhzEgdv_keh';
        break;
        
        case 'web-test.taxi-beam.com':
            mapkey = 'By3R73D@ZWBktIBfnHAWqX552qae@Pr3zkf0T72igEB1LrH6cq';
        break;

        case 'dispatcher.taxi-beam.com':
            mapkey = '1bhbrKJEK13KZknb7NqsgZ_nKsn6msiSKkr1nPfYUvgkFvRXxM';
        break;

        case 'web.taxi-beam.com':
            mapkey = 'hy16Hs@C4rMKuE1r8t2x0XQK@ZA6kLKCyd3a$Ggc2diUh1kZ5l';
        break; 
        
        case 'callcenter.taxi-beam.com':
            mapkey = 'HJq_rFQ_AnO5AzWqA@hNPigqcR8PuXxUq9HP17G61oJTN86pYO' ;
        break;

        case 'callcenter-dev.taxi-beam.com':
            mapkey = '6AXnCI5p5johsESn4Z4tfTLcGqISZ5kvIfUR_YTtg1qCcECm6F' ;
        break;

        case 'callcenter-test.taxi-beam.com':
            mapkey = 'Vw4s021$DdaMugLVCRu_a88ZQX6sicLItBYk1jUYib2sGDlXox' ;
        break;        

        default:
            mapkey = 'Evs0z2OaYLDO8e3sl8HwK7MwiS66Y@7Yqo-K$eeRwRQkxqrbO$' ;

} 

document.write('<script src="https://nhmap.ecartmap.com/v1_2/?key='+mapkey+'&language=th"></script>');