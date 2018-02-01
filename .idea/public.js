/**
 * Created by lincoln on 2018/1/18.
 */
//数据访问
var  request = function(obj){
    this.method = obj.method ||'';
    this.url = obj.url ||'';
    this.call_back = obj.call_back || '';
    this.data = obj.data || null;
    this.async = obj.async || false;
    this.createXHR = function(){
        if(typeof XMLHttpRequest != "undefined"){
            return new XMLHttpRequest();
        }else if (typeof ActiveXObject !='undefined'){
            if(typeof arguments.callee.activeXString !='string'){
                var versions = ['MSXML2.XMLHttp.6.0','MSXML2.XMLHttp.3.0',"MSXML2.XMLHttp"],i,len;
                for(var i = 0, len =versions.length; i< len; i++){
                    try{
                        new ActiveXObject(versions[i]);
                        arguments.callee.activeXString = versions[i];
                        break;
                    }catch (ex){
                        throw ex;
                    }
                }
            }
            return new ActiveXObject(arguments.callee.activeXString);
        }else{
            throw new Error("NO XHR object available");
        }
    }
}
request.prototype.send =  function(){
    var xhr = this.createXHR();
    xhr.onreadystatechange = function(e){
        if(xhr.readyState == 4){
            if((xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) && this.call_back){
                this.call_back(e.data);
            }else{
                alert("出错了");
            }
        }
    };
    xhr.open(this.method,this.url,this.async);
    xhr.setRequestHeader("Content-Type", "applicant/x-www-form-urlencoded");
    xhr.send(this.data);
}

request.prototype.get = function(url,call_back,async){
    var xhr = this.createXHR();
    xhr.onreadystatechange = function(e){
        if((xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) && call_back ){
            call_back(e.data);
        }else{
            alert(e);
        }
    };
    xhr.open('get',url,async || false);
    xhr.setRequestHeader("Content-Type", "applicant/x-www-form-urlencoded");
    xhr.send(null);
}
request.prototype.post = function(url,data,call_back,async){
    var xhr = this.createXHR();
    xhr.onreadystatechange = function(e){
        if((xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) && call_back ){
            call_back(e.data);
        }else{
            alert(e);
        }
    };
    xhr.open('post',url,async || false);
    xhr.setRequestHeader("Content-Type", "applicant/x-www-form-urlencoded");
    xhr.send(data);
}

//序列号组件
function Serialize(form){
    var parts = {};
    for(var i = 0; i < form.elements.length; i++){
        var field = form.elements[i];
        switch (field.type){
            case "select-one":
            case "select-multiple":
                parts[field.name] = field.value;
                break;
            case "text":
                parts[field.name] = field.value;
                break;
            case "textarea":
                parts[field.name] = field.value;
                break;
            case "checkbox":
            case "radio":
                if(field.checked){
                    parts[field.name] = field.value;
                }
                break;
            case "file":
            case "button":
            case "reset":
            case "undefined":
                break;

        }
    }
    return parts;
}

//表格封装
