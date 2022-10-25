var current_lvl_page = 1;
var current_pkg_page = 1;

function setSelectionRange(input, selectionStart, selectionEnd)
{
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    } else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    }
}

function setCaretToPos(input, pos)
{
    setSelectionRange(input, pos, pos);
}

function insertAtCaret(areaId,text)
{
    var txtarea = document.getElementById(areaId);
    var scrollPos = txtarea.scrollTop;
    var strPos = 0;
    var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ? 
    "ff" : (document.selection ? "ie" : false ) );

    if (br == "ie") {
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart ('character', -txtarea.value.length);
        strPos = range.text.length;
    } else if (br == "ff")
        strPos = txtarea.selectionStart;

    var front = (txtarea.value).substring(0,strPos);  
    var back = (txtarea.value).substring(strPos,txtarea.value.length); 
    txtarea.value=front+text+back;
    strPos = strPos + text.length;
    if (br == "ie") {
        txtarea.focus();
        var range = document.selection.createRange();
        range.moveStart ('character', -txtarea.value.length);
        range.moveStart ('character', strPos);
        range.moveEnd ('character', 0);
        range.select();
    } else if (br == "ff") {
        txtarea.selectionStart = strPos;
        txtarea.selectionEnd = strPos;
        txtarea.focus();
    }

    txtarea.scrollTop = scrollPos;

    return strPos;
}

Element.prototype.hasClass = function (className) {
    return new RegExp(' ' + className + ' ').test(' ' + this.className + ' ');
};


Element.prototype.addClass = function (className) {
    if (!this.hasClass(className)) {
        this.className += ' ' + className;
    }
};



Element.prototype.removeClass = function (className) {
    var newClass = ' ' + this.className.replace(/[\t\r\n]/g, ' ') + ' '
    if (this.hasClass(className)) {
        while (newClass.indexOf( ' ' + className + ' ') >= 0) {
            newClass = newClass.replace(' ' + className + ' ', ' ');
        }
        this.className = newClass.replace(/^\s+|\s+$/g, ' ');
    }
};



Element.prototype.toggleClass = function (className) {
    var newClass = ' ' + this.className.replace(/[\t\r\n]/g, " ") + ' ';
    if (this.hasClass(className)) {
        while (newClass.indexOf(" " + className + " ") >= 0) {
            newClass = newClass.replace(" " + className + " ", " ");
        }
        this.className = newClass.replace(/^\s+|\s+$/g, ' ');
    } else {
        this.className += ' ' + className;
    }
};

function get_hash_value(key)
{
    if (window.location.hash) {
        var m = window.location.hash.match(new RegExp(key+'=([^&]*)'));
        if (m != null)
            return m[1];
    }

    return undefined;
}

function set_hash_value(key, value)
{
    var key_value = get_hash_value(key);

    if (typeof key_value == "undefined") {
        if (window.location.hash)
            window.location.hash += "&"+key+"="+value;
        else
            window.location.hash = "#"+key+"="+value;
    } else
        window.location.hash = window.location.hash.replace(key+"="+key_value, key+"="+value);
}

function remove_entry(c_id, l_id)
{
    if (confirm('Are you sure you want to remove this entry from the contest?')) {
        window.location = 'http://principiagame.com/remove_entry.php?contest_id='+c_id+'&level_id='+l_id;
    }
}

function entity_page(base_id, p_val, n, t, e, h)
{
    //$log("entity_page("+base_id+", "+p_val+", "+n+", "+t+", "+e+", "+h+")");
    var loading_el = base_id + '-pgr-loader';
    var list_el = base_id + '-pgr-list';
    var btn_next = Sizzle('#'+base_id + '-pgr-btn-next')[0];
    var btn_prev = Sizzle('#'+base_id + '-pgr-btn-prev')[0];
    var buttons_el = base_id + '-pgr-btn';
    var uid = $('pgr-uid');

    var p = parseInt(p_val);
    n = typeof n !== 'undefined' ? n : 15;
    var u = (uid !== null ? uid.value : -1);
    t = typeof t !== 'undefined' ? t : -1;
    e = typeof e !== 'undefined' ? e : -1;
    h = typeof h !== 'undefined' ? h : -1;
    var loading_img = $E('img', {
            'src': 'http://img.principiagame.com/static/ajax-loader.gif',
            'id':  base_id+'-loading-img'
            });

    var children = Sizzle('#'+base_id+'-list li');
    for (var x=0; x<children.length; ++x) {
        $T(children[x], {'opacity': [1.0,0.2]});
    }

    var buttons = $$('.'+buttons_el);
    for (var i=0; i<buttons.length; ++i) {
        buttons[i].disabled = "disabled";
    }

    btn_next.disabled = "disabled";
    btn_prev.disabled = "disabled";

    var e_list = $(list_el);

    /* only display the loading circle if it the process takes longer than 150ms to complete */
    var loading_timeout = setTimeout(function(){$insert(loading_el, loading_img);}, 150);

    var r = new $R('/_entity.php', {
            'complete': function(data) {
                clearTimeout(loading_timeout);

                var limg = $(base_id+'-loading-img');
                if (limg) $remove(limg);

                $T(e_list, {'opacity': [0.2,1.0]});

                if (data.length > 0) {
                    if (h == 1) {
                        if (e == 1) {
                            current_lvl_page = (p+1);
                            set_hash_value('lp', (p+1));
                        } else if (e == 2) {
                            current_pkg_page = (p+1);
                            set_hash_value('pp', (p+1));
                        }
                    }

                    e_list.innerHTML = data;

                    for (var i=0; i<buttons.length; ++i) {
                        if (buttons[i].value == p) buttons[i].disabled = "disabled";
                        else buttons[i].disabled = "";
                    }

                    btn_next.value = ''+(p+1);
                    btn_prev.value = ''+(p-1);

                    if (p == 0) btn_prev.disabled = "disabled";
                    else        btn_prev.disabled = "";

                    if ((p+1) >= buttons.length) btn_next.disabled = "disabled";
                    else                         btn_next.disabled = "";
                }
            }
        });

    r.post({'p':p,'u':u,'n':n,'t':t,'e':e});
}

function read_hash()
{
    var base = window.location.pathname;
    if (base.charAt(base.length-1) == '/') base = base.substring(0, base.length-1);
    var cur_page_arr = base.split('/');
    var cur_page = '';
    if (cur_page_arr.length > 2) {
        cur_page = cur_page_arr[1];
    } else {
        cur_page = cur_page_arr[cur_page_arr.length-1];
    }

    var base_id = 'pager';
    var base_pkg_id = 'pager-pkg';
    var n = 25;
    var pn = 25;
    var t = 0;

    if (cur_page == 'latest') {
        base_id = 'latest';
        t = 0;
    } else if (cur_page == 'adventures') {
        base_id = 'latest';
        t = 1;
    } else if (cur_page == 'puzzles') {
        base_id = 'latest';
        t = 2;
    } else if (cur_page == 'custom-levels') {
        base_id = 'latest';
        t = 3;
    } else if (cur_page == 'packages') {
        base_id = 'latest';
        t = 4;
        pn = 25;
    } else if (cur_page == 'user') {
        base_id = 'lvl';
        base_pkg_id = 'pkg';
        t = 5;
        n = 20;
        pn = 5;
    }

    var lp = get_hash_value('lp');
    var pp = get_hash_value('pp');

    if (typeof lp != "undefined") {
        if (current_lvl_page != lp)
            entity_page(base_id, lp-1, n, t, 1, 0);

        current_lvl_page = lp;
    }
    if (typeof pp != "undefined") {
        if (current_pkg_page != pp)
            entity_page(base_pkg_id, pp-1, pn, t, 2, 0);

        current_pkg_page = pp;
    }
}

$ready = function() {
    read_hash();
    if (typeof $ready2 == 'function') {
        $ready2();
    }
};

window.onpopstate = function(event) {
    read_hash();
};
