$ = function (el, from) {
    return (from || document).getElementById(el);
}

$each = function (th, cb) { for (var x=0;x<th.length; x++) cb.call(th[x]); };
$first = function (el) {
    if (undefined != el.firstElementChild) return el.firstElementChild;
    for (var x=0; el.childNodes[x]; x++)
        if (el.childNodes[x].nodeType == 1)
            return el.childNodes[x];
    return null;
};

$stop = function (e) {
    if (typeof e.stopPropagation != 'undefined')
        e.stopPropagation();
    else if (window.event)
        window.event.cancelBubble = true;
};

$insert_before = function (base, el1, el2)
{
    var t,i,b;
    var t = (typeof base == 'string' ? $(base) : base);
    var i = (typeof el1 == 'string' ? $(el1) : el1);
    var b = (typeof el2 == 'string' ? $(el2) : el2);

    if (typeof i == 'object' && typeof i.length == 'number') {
        for (x in i)
            b = t.insertBefore(i[x], b);
    } else
        t.insertBefore(i, b);
};

$insert = function (el1, el2)
{
    var t,i;
    if (typeof el2 == 'undefined') {
        if (typeof el1 == 'string')
            i = $(el1);
        else
            i = el1;
        t = document.body;
    } else {
        t = (typeof el1 == 'string' ? $(el1) : el1);
        i = (typeof el2 == 'string' ? $(el2) : el2);
    }

    if (typeof i == 'object' && typeof i.length == 'number') {
        for (x in i)
            t.appendChild(i[x]);
    } else
        t.appendChild(i);
};

$remove = function (el) {
    el = el || this;
    if (typeof el == 'string') el = $(el);
    el.parentNode.removeChild(el);
};

$hide = function (el) { $S(el, {'display': 'none'}); };
$show = function (el) { $S(el, {'display': 'block'}); };

$parent = function (el) {return el.parentNode;}

if (document.getElementsByClassName == undefined) {
    $cls = function (cls, els) {
        var reg = new RegExp("(?:^|\\s)"+cls+"(?:$|\\s)");
        if (els == undefined)
            els = document.getElementsByTagName("*");
        var r = [], e;
        for (var x=0; (e = els[x]) != null; x++)
            if (e.className != null && reg.test(e.className))
                r.push(e);
        return r;
    };
} else
    $cls = function (cls) {return document.getElementsByClassName(cls)};

$A = function (el, attrs) {
    if (typeof el == 'string') el = $(el);
    if (typeof attrs == 'string')
        return el.getAttribute(attrs);

    if (attrs instanceof Array) {
        var ret = {};
        for (var x=0; x<attrs.length; x++)
            ret[attrs[x]] = el.getAttribute(attrs[x]);
        return ret;
    }

    for (x in attrs)
        el.setAttribute(x, attrs[x]);
};

$T = function (el, attrs, callbacks) {
    var job = {el:el, attrs:{}};

    if (!el)
        return;
    if (el.__t != undefined)
        $T.cancel(el.__t);

    for (x in callbacks)
        job[x] = callbacks[x];

    for (x in attrs) {
        var s,e,unit,step;
        if (attrs[x] instanceof Array) {
            e = attrs[x][1];
            var o = {};
            s = o[x] = attrs[x][0];
            if (typeof attrs[x][2] == 'undefined')
                unit = '';
            else
                unit = attrs[x][2];
            $S(el, o);
        } else {
            e = attrs[x];
            s = 0;
            unit = '';
        }

        if (s instanceof Array) {
            /* probably [r,g,b] */
            step = [];
            for (y in s)
                step.push((e[y] - s[y]) / 250*25);
            unit = Array;
        } else
            step = (e-s)/250*25;

        job.attrs[x] = [s, e, step, unit];
        if (s>e) job.cmp = function (_v,_e) {return _v<=_e};
        else job.cmp = function (_v,_e) {return _v>=_e};
    }


    $T.last_id ++;
    $T.jobs[$T.last_id] = job;
    el.__t = $T.last_id;

    if ($T.timer === null)
        $T.timer = setInterval("$T.frame()", 25);
};

$T.frame = function () {
    var remove = {};
    for (jv in this.jobs) {
        var j = this.jobs[jv], e;
        if (typeof j == 'undefined')
            continue;
        for (y in j.attrs) {
            var done = false;
            if (j.attrs[y][0] instanceof Array) {
                e = j.attrs[y][1][0];
                for (z in j.attrs[y][0]) {
                    j.attrs[y][0][z] += j.attrs[y][2][z];
                    if (j.cmp(j.attrs[y][0][z], j.attrs[y][1][z]))
                        done = true;
                }
                v = j.attrs[y][0];
            } else {
                v = j.attrs[y][0] += j.attrs[y][2];
                e = j.attrs[y][1];
                if (j.cmp(v, e))
                    done = true;
            }

            var unit = j.attrs[y][3];
            if (done) {
                remove[jv] = 1;
                v = j.attrs[y][1];
            }
            
            if (unit == Array)
                $S(j.el, $o(y, v));
            else
                $S(j.el, $o(y, v+unit));
        }
    }

    for (r in remove) {
        if (typeof this.jobs[r].done != 'undefined')
            this.jobs[r].done.call(this.jobs[r].el);
        this.cancel(r);
    }
};

$T.cancel = function (id) {
    this.jobs[id].el.__t = undefined;
    delete this.jobs[id];
};

$o = function (n,v) {var o={};o[n]=v;return o;};
$m = function (dest,src) {
    for (x in src) {
        if (typeof src[x] == "object")
	    $o.m(dest[x] = {},src[x]);
	else
            dest[x] = src[x];
	    
    }
    return dest;
};

$T.jobs = {};
$T.timer = null;
$T.last_id = 0;

$P = function (el, absolute){
    if (typeof el == 'string') el = $(el);

    if (typeof absolute == 'undefined')
        return {'x': el.offsetLeft, 'y': el.offsetTop};

    var x=0,y=0;
    do {
        x += el.offsetLeft || 0;
        y += el.offsetTop || 0;
        el = el.offsetParent;
    } while (el);

    return {'x': x, 'y': y};
};

$E = function (tag, opts) {
    var el;

    if (typeof tag == 'undefined' || tag == null)
        el = document.createDocumentFragment();
    else {
        el = document.createElement(tag);

        if (typeof opts == 'object') {
            for (o in opts) {
                if (o == 'html')
                    el.innerHTML = opts[o];
                else
                    el.setAttribute(o, opts[o]);
            }
        } else if (typeof opts == 'string')
            el.innerHTML = opts;
    }

    return el;
};

$D = function (el) {
    if (typeof el == 'string')
        el = $(el);

    return {
        'w': el.offsetWidth,
        'h': el.offsetHeight
    };
}

$V = function (el) {
    if (typeof el == 'undefined') {
        var w,h,x,y;
        if (typeof window.pageXOffset == 'number') {
            return {'width': window.innerWidth, 'height': window.innerHeight,
                    'x': window.pageXOffset, 'y': window.pageYOffset};
        } else {
            var de = document.documentElement;
            return {
                'width': de.clientWidth, 'height':de.clientHeight,
                'x': de.scrollLeft, 'y': de.scrollTop
                };
        }
    }
}

$S = function (el, arg)
{
    var _n = function (s) {
        var o;
        if ((o = s.indexOf('-')) != -1)
            s = s.substr(0, o) + s[o+1].toUpperCase() + s.substr(o+2);
        return s;
    };

    if (typeof el == "string")
        el = $(el);

    if (typeof arg == "string")
        return el.style[_n(arg)];

    if (arg instanceof Array) {
        var ret = {};
        for (x in arg) 
            ret[arg[x]] = $S(el, arg[x]);
        return ret;
    }

    for (a in arg) {
        if (a == 'opacity' && document.attachEvent)
            el.style.filter = 'alpha(opacity='+(arg[a]*100)+')';
        else {
            var v;
            if (arg[a] instanceof Array) {
                v = arg[a];
                v = 'rgb('+v[0]+','+v[1]+','+v[2]+')';
            } else
                v = arg[a];
            el.style[_n(a)] = v;
        }
    }
};

$C = {
    'set': function (nm, v, opts) {
        var ex='';
        if (typeof opts != 'undefined') {
            for (opt in opts) {
                if (opt == 'expires') {
                    var d = new Date();
                    d.setDate(d.getDate()+opts[opt]);
                    ex+=';'+opt+'='+d.toGMTString();
                } else
                    ex+=';'+opt+'='+opts[opt];
            }
        }
        document.cookie = nm+'='+escape(v)+ex;
    },
    'get': function (nm) {
        var s = document.cookie,c,e;
        if (s.length > 0 && ((c = s.indexOf(nm+'=')) == 0 || (c = s.indexOf(' '+nm+'=')) != -1)) {
            e = s.indexOf(';', c);
            if (e == -1) e = s.length;
            return unescape(s.substring(c+nm.length+1,e));
        }
        return null;
    }
};

$R = function(url, callbacks, timeout)
{
    this.cb = callbacks || {};
    this.url = url;
    this.async = true;
    var h = null;
    var t = (timeout !== 'undefined' ? timeout : 0);

    if (window.XMLHttpRequest) {
        h = new XMLHttpRequest();
    } else {
        try {
            h = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                h = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
                h = null;
            }
        }
    }

    //if (h != null) h.timeout = t;

    var self = this;
    h.onreadystatechange = function () {
        if (h.readyState == 4 || h.readyState == "complete") {
            if (typeof self.cb.complete != 'undefined')
                self.cb.complete(h.responseText);
        }
    }

    this.h = h;
}

$R.prototype = {
    'get': function(args) {
        var s='?';
        for (a in args)
            s+=a+'='+encodeURIComponent(args[a])+'&';

        if (typeof this.cb.request != 'undefined')
            this.cb.request();

        this.h.open("GET", this.url+s, this.async);
        this.h.send(null);
    },

    'post': function (args) {
    var s='';
    for (a in args)
        s+=a+'='+encodeURIComponent(args[a])+'&';

    if (typeof this.cb.request != 'undefined')
        this.cb.request();

    this.h.open("POST", this.url, this.async);
    this.h.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    /*
    this.h.setRequestHeader("Content-length", s.length);
    this.h.setRequestHeader("Connection", "close");
    */
    this.h.send(s);
}

};

$__ready = function () {
    if (typeof $ready != undefined)
        $ready();
};

if (document.addEventListener) {
    $listen = function(el, ev, func) {
				//console.log(Object.prototype.toString.call(el));
        if (/Array|NodeList|HTMLCollection/.test(Object.prototype.toString.call(el))) {
            if (el.length == 0)
                return;
            $each(el, function () { this.addEventListener(ev, func, false); });
        } else {
            el.addEventListener(ev, func, false);
				}
    };
    document.addEventListener("DOMContentLoaded", $__ready, false);
} else if (document.attachEvent) {
    $listen = function(el, ev, func) {
        if (!el)
            return;
        ev = 'on'+ev;
        var _func = function (e) { func.call(e.srcElement || this, e); };
        if (/Array|HTMLCollection/.test(Object.prototype.toString.call(el))) {
            if (el.length == 0)
                return;
            $each(el, function (x) {x.attachEvent(ev,_func)});
        } else
            el.attachEvent(ev, _func);
    };
} else
    $listen = function() {};

$log = function (x) {
    if (typeof console != 'undefined' && typeof console.log != 'undefined')
        console.log(x);
}

$dump = function (v, ret) {
    var rr='';
    var log = (typeof ret == 'undefined' || !ret ? $log : function (vv) { rr+=vv+"\n"; });

    if (typeof v == 'string') {
        log('String ('+v.length+') "'+v+'"');
    } else if (v instanceof Array) {
        var s = ''
        if (v.length) {
            for (x in v)
                s += '['+x+'] => '+v[x]+', ';
            s = s.substr(0,s.length-2);
        }
        log('Array ('+v.length+') {'+s+'}');
    } else {
        for (x in v) {
            var s = ''
            for (x in v)
                s += '['+x+'] => '+v[x]+', ';
            s = s.substr(0,s.length-2);
            log('Object {'+s+'}');
        }
    }

    return rr;
}

$$ = function (sel)
{
    sel = sel.split('.');
    if (!sel[0].length)
        return $cls(sel[1]);
    var e = document.getElementsByTagName(sel[0]);
    if (sel.length == 1) return e;
    return $cls(sel[1], e);
};


$toggle = function (el, display) {
    if (typeof el == 'string')
        el = $(el);

    if ($S(el, 'display') == display)
        $S(el, {'display': 'none'});
    else
        $S(el, {'display': display});
};

$schedule = function (fn, _obj, ms) {
    setTimeout(function () {
        fn.call(_obj);
    }, ms);
};
