(function() {
	var kijeUsage = {};
	kijeUsage.count = 0;
	kijeUsage.prevButtonState = false;
	kijeUsage.nextButtonState = true;
	kijeUsage.contents = [
	{
		title: 'Basic set style',
		content: 'you can select the text, set style with toolbar click',
		className: 'usage-1',
		control: 'mouse'
	},{
		title: 'Set style using [Alt] key',
		content: 'also you can use [Alt] key for setting style to your post',
		className: 'usage-2',
		control: 'keyboard'
	},{
		title: 'Change to select Mode',
		content: 'first, Change to select mode then set style with [Alt] key for fastly',
		className: 'usage-3',
		control: 'keyboard'
	},{
		title: '3 Times [Ctrl] key extend',
		content: 'you can extend selection for three time with [Ctrl] keydown',
		className: 'usage-4',
		control: 'keyboard'
	},{
		title: 'Apply theme to your post',
		content: 'when you finished your job, you can find themeToolbar down the page',
		className: 'usage-5',
		control: 'mouse'
	}
	];
    tinymce.create("tinymce.plugins.kije_add_button", {
        init : function(button) {
            button.addButton("kije_add_button", {
            	title: 'Usage',
                icon: 'kije-editor-custom-icon',
                cmd : "clickUsageButton"
            });

            button.addCommand("clickUsageButton", function() {
            	if (!kijeUsage.usage) {
	            	var usage = createUsageBox();
	            	kijeUsage.usage = usage;
	            	var closeButton = document.getElementById('kije-usage-close-button');
	            	closeButton.addEventListener('click', hideUsage, false);
	            	
	            	kijeUsage.prevButton = document.getElementsByClassName('ked_usage_prevButton')[0];
	            	kijeUsage.nextButton = document.getElementsByClassName('ked_usage_nextButton')[0];

	            	kijeUsage.dom = {
	            		title: document.getElementById('kije-usage-title'),
	            		image: document.getElementById('kije-usage-image'),
	            		content: document.getElementById('kije-usage-text')
	            	}

	            	kijeUsage.prevButton.addEventListener('click', function () {
	            		kijeUsageCounter('prev');
	            	});
	            	kijeUsage.nextButton.addEventListener('click', function () {
	            		kijeUsageCounter('next');
	            	});
	            	kijeUsageCounter('init');
	            	kijeUsage.usage.className = kijeUsage.usage.className + ' is-on';
            	}else{
            		if (kijeUsage.usage.className.indexOf('is-on')==-1){
            			kijeUsage.prevButton.style.visibility = 'hidden';
            			kijeUsage.nextButton.style.visibility = 'visible';
            			kijeUsage.usage.className = kijeUsage.usage.className + ' is-on';
            			kijeUsageChangeContent(null, true);
            		}
            	}

            });
        }
    });

	function kijeUsageCounter(button) {
		var count = kijeUsage.count;
		if (button === 'prev') {
			if (count == 4) {
				kijeUsage.nextButton.style.visibility = 'visible';
			}
			if (count != 0) {
				count--;
				if (count == 0) {
					kijeUsage.prevButton.style.visibility = 'hidden';
				}
			}
		}
		else if (button === 'next') {
			if (count == 0) {
				kijeUsage.prevButton.style.visibility = 'visible';
			}
			if (count != 4) {
				count++;
				if (count == 4) {
					kijeUsage.nextButton.style.visibility = 'hidden';
				}
			}
		}else if (button === 'init') {
			kijeUsage.prevButton.style.visibility = 'hidden';
		}
		kijeUsage.count = count;
		kijeUsageChangeContent(count);
	}
	function kijeUsageChangeContent(index, setDefault) {
		if (setDefault) {
			var usage = kijeUsage.contents[0];
			kijeUsage.dom.title.innerHTML = usage.title;
			kijeUsage.dom.content.innerHTML = usage.content;
			kijeUsage.dom.image.className = usage.className;
			return false;
		}
		var usage = kijeUsage.contents[index];
		kijeUsage.dom.title.innerHTML = usage.title;
		kijeUsage.dom.content.innerHTML = usage.content;
		kijeUsage.dom.image.className = usage.className;
	}

    function hideUsage() {
    	kijeUsage.usage.className = kijeUsage.usage.className.replace('is-on','');
    	kijeUsage.prevButton.style.visibility = 'hidden';
    	kijeUsage.nextButton.style.visibility = 'hidden';
    	kijeUsage.count = 0;
    }
	function createUsageBox() {
		var usageBox = document.createElement('div');
		usageBox.innerHTML = " <div class='kije-usage-header'><span id='kije-usage-title'>test</span><button id='kije-usage-close-button'></button></div><div class='kije-usage-content'><span class='ked_usage_prevButton'></span><div id='kije-usage-image' class='usage-1'></div><span class='ked_usage_nextButton'></span><p id='kije-usage-text'>test</p></div>";
		usageBox.className = 'kije-editor-usage';
		document.body.appendChild(usageBox);
		var rect = getBoxPosition();
		usageBox.style.top = (rect.top - rect.iconHeight) + 'px';
		usageBox.style.left = (rect.left + 30) + 'px';
		return usageBox;
	}
	function getBoxPosition() {
        var questionMark = document.getElementsByClassName('mce-i-kije-editor-custom-icon')[0];
        var rect = questionMark.getBoundingClientRect();
        rect.iconWidth = questionMark.offsetWidth * 2;
        rect.iconHeight = questionMark.offsetHeight * 4;
        return rect;
	}

    tinymce.PluginManager.add("kije_add_button", tinymce.plugins.kije_add_button);
})();
