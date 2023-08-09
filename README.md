# comm_archive
stuff for the old community site archive reverse proxy

## example config

```nginx
proxy_cache_path  /srv/http/archive_principia/img/  levels=1:2    keys_zone=principia_archive_img:10m
inactive=999d  max_size=1g;

#principia archive
server {
	listen 80;
	server_name archive_principia.uwu;

	root /srv/http/archive_principia;

	error_page 403 /page_excluded.html;

	location ~(post_comment.php|login|register|add-video|lua|subscribe|store|download|upload.php|logout)$ { return 403; }

	location ~/apZodIaL1/(bppfoal2_.php|cppfoal3_.php|xx.php) { return 403; }

	location /img/ {
		proxy_pass http://img.principiagame.com/;
		proxy_set_header Host "img.principiagame.com";
		proxy_cache            principia_archive_img;
		proxy_cache_valid 200 999d;
					proxy_cache_use_stale  error timeout invalid_header updating
								http_500 http_502 http_503 http_504;
		break;
	}

	location / {
		try_files $uri @archive;
	}

	location @archive {
		proxy_pass http://archive.principiagame.com;
		proxy_set_header Host "archive.principiagame.com";

		sub_filter_once off;
		sub_filter ' &ndash; <a href="/lua">Lua Tools</a>' '';
		sub_filter 'http://img.principiagame.com/' '/img/';
		sub_filter 'principia://archive.principiagame.com' 'principia://archive.principia-web.se';
		sub_filter '<div id="wrapper">' '<div id="wrapper"><div class="exitbutton"><a href="https://principia-web.se/">&lt; Go back to principia-web</a></div>';
		sub_filter 'Discuss this level' 'Comments';
		sub_filter '<div id="content" class="home">' "<div class=\"archive-head\">
<h1>Principia Official Community Site Archive</h1>

<p>This is an archive of the official community site, containing all levels that was uploaded spanning from the game\'s release in 2013 to the community site\'s shutdown in 2018.</p>

<p>A recent enough version of the open source version of Principia is required to play levels.</p>
</div>";
		sub_filter "</div>
<script type=\"text/javascript\">
function addreply(name)" "<script type=\"text/javascript\">function addreply(name)";
		sub_filter "</div>
<script type=\"text/javascript\">
var HoverListener" "<script type=\"text/javascript\">var HoverListener";

	}

}
```
