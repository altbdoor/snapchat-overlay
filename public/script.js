(function (d, w) {
    var formImage = d.getElementById('form-image');
    var viewport = d.getElementById('viewport');
    var ctx = viewport.getContext('2d');
    
    var bgImage = null;
    
    d.getElementById('form-reset').click();
    
    function clearViewport () {
        viewport.width = 300;
        viewport.height = 150;
        ctx.clearRect(0, 0, viewport.width, viewport.height);
        bgImage = null;
    }
    
    var form = d.querySelector('form');
    form.onreset = clearViewport;
    form.onsubmit = function (e) { e.preventDefault(); };
    
    formImage.onchange = function () {
        var file = null;
        
        if (this.files && this.files[0]) {
            file = this.files[0];
        }
        
        if (file) {
            clearViewport();
            
            var fr = new FileReader();
            fr.onload = function (e) {
                var img = new Image();
                img.onload = function () {
                    bgImage = this;
                    
                    var evt = document.createEvent('HTMLEvents');
                    evt.initEvent('input', true, false);
                    d.querySelector('#container-tweak input').dispatchEvent(evt);
                };
                img.src = e.target.result;
            };
            fr.readAsDataURL(file);
        }
    };
    
    // http://stackoverflow.com/questions/5623838
    function hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
        
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    function redrawViewport (param) {
        if (bgImage) {
            ctx.clearRect(0, 0, bgImage.width, bgImage.height);
            
            viewport.width = bgImage.width;
            viewport.height = bgImage.height;
            ctx.drawImage(bgImage, 0, 0);
            
            var bgColorHex = (param.bg_color || '000');
            var bgColorRgb = hexToRgb(bgColorHex);
            var bgTrans = (param.bg_trans || '0.65');
            
            if (bgColorRgb) {
                bgColorRgb = [
                    bgColorRgb.r,
                    bgColorRgb.g,
                    bgColorRgb.b,
                    bgTrans
                ].join(',');
            }
            else {
                bgColorRgb = '0, 0, 0, ' + bgTrans;
            }
            
            var textSize = parseInt(param.text_size || 30);
            var bgPad = parseInt(param.bg_pad || 15);
            var textPosTop = parseInt(param.text_top_pos || 100);
            var bgPosTop = textPosTop - bgPad;
            
            ctx.fillStyle = 'rgba(' + bgColorRgb  + ')';
            ctx.fillRect(0, bgPosTop, viewport.width, (textSize + (bgPad * 2)));
            
            var counterTextSize = parseInt(param.counter_text_size || 30);
            var counterPad = parseInt(param.counter_pad || 12);
            var counterDimension = (counterTextSize + (counterPad * 2));
            
            var counterGap = parseInt(param.counter_gap || 15);
            var counterCurve = parseInt(param.counter_curve || 10);
            var counterBgPosLeft = viewport.width - counterDimension - counterGap;
            
            ctxDrawRoundedSquare(ctx, counterBgPosLeft, counterGap, counterDimension, counterDimension, counterCurve);
            ctx.fill();
            
            ctx.font = '400 ' + textSize + 'px ' + (param.text_font_family || 'Lato');
            ctx.fillStyle = '#' + (param.text_color || 'fff');
            ctx.textAlign = 'center';
            ctx.textBaseline = 'hanging';
            ctx.fillText((param.text_content || ''), (viewport.width / 2), textPosTop);
            
            ctx.font = '400 ' + counterTextSize + 'px ' + (param.text_font_family || 'Lato');
            var counterTextPosTop = counterGap + counterPad;
            var counterTextPosLeft = (viewport.width - (counterDimension / 2) - counterGap);
            ctx.fillText((param.counter_content || '8'), counterTextPosLeft, counterTextPosTop);
            
        }
    }
    
    // http://stackoverflow.com/questions/1255512
    function ctxDrawRoundedSquare (_ctx, x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        _ctx.beginPath();
        _ctx.moveTo(x+r, y);
        _ctx.arcTo(x+w, y,   x+w, y+h, r);
        _ctx.arcTo(x+w, y+h, x,   y+h, r);
        _ctx.arcTo(x,   y+h, x,   y,   r);
        _ctx.arcTo(x,   y,   x+w, y,   r);
        _ctx.closePath();
    }
    
    // http://stackoverflow.com/questions/25248286/
    var containerTweak = d.getElementById('container-tweak');
    containerTweak.addEventListener('input', function (e) {
        for (var target=e.target; target && target!=this; target=target.parentNode) {
            if (target.nodeName.toLowerCase() == 'input') {
                var inputList = containerTweak.querySelectorAll('[name]');
                var inputData = {};
                
                for (var i=0; i<inputList.length; i++) {
                    var j = inputList[i];
                    inputData[j.name] = j.value;
                }
                redrawViewport(inputData);
                break;
            }
        }
    });
    
    [].forEach.call(d.querySelectorAll('.generate-image'), function (item) {
        item.onclick = function () {
            var itemType = item.getAttribute('data-type');
            var imgQuality = parseInt(d.querySelector('[name="image_quality"]').value);
            var imgUrl = viewport.toDataURL(itemType, (imgQuality / 100));
            
            w.open(imgUrl);
        };
    });
    
})(document, window);
