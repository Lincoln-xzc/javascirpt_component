/**
 * Created by lincoln on 2018/1/18.
 */
var CommonData = {}
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
Object.prototype.btn_bind = function(fun, is_enabled){
    "use strict";
    var btns = this;
    if(btns.length > 1){
        for(var i = 0, len = btns.length; i < len; i++){
          if(is_enabled === false){
              btns[i].removeAttribute("disabled");
          }else{
              btns[i].setAttribute("disabled", "true");
          }
          if(fun){
              btns[i].addEventListener("click",fun,false);
          }
        }
    }else{
        if(is_enabled === false){
            btns.removeAttribute("disabled");
        }else{
            btns.setAttribute("disabled","true");
        }
        if(fun){
            btns.addEventListener("click",fun,false);
        }
    }



}

Object.prototype.btn_disabled = function(dis){
    "use strict";
    var nodeList = this;
    if(nodeList.length == 1){
        if(dis === false){
            nodeList.removeAttribute("disabled");
        }else{
            nodeList.setAttribute("disabled","true");
        }
    }else{
        for(var i = 0, len = nodeList.length; i < len; i++){
            if(dis === false){
                nodeList[i].removeAttribute("disabled");
            }else{
                nodeList[i].addEventListener("disabled","true");
            }
        }
    }
}
Object.prototype.hide = function(){
    "use strict";
    var nodeList = this;
    if(nodeList.length ==1){
        nodeList.style.display = "none";
    }else{
        for(var i = 0; i < nodeList.length; i++){
            nodeList[i].style.display = "none";
        }
    }
}
Object.prototype.show = function(){
    "use strict";
    var nodeList = this;
    if(nodeList.length == 1){
        nodeList.style.display = "block";
    }else{
        for(var i =0; i < nodeList.length; i++){
            nodeList[i].style.display = "block";
        }
    }
}

CommonData.pagers = {};
function Pager(table_id, config){
    "use strict";
    if(CommonData.pagers[table_id]){
        return CommonData.pagers[table_id];
    }
    this.table_id = table_id; //表格id
    this.table = document.querySelector("#"+table_id); //表格
    this.page_size = config.page_size || -1; //每页个数
    this.page_index = 0; //第几页
    this.total_count = 0; //总数
    this.page_count = 0;  //总页数
    this.ajax_url = config.ajax_url;  //请求地址
    this.ajax_method = config.ajax_method; //请求方法
    this.RowSelect = config.RowSelect; //选中行
    this.DbRecored = config.DbRecored; //双击行
    this.RowOver = config.RowOver;
    this.NewRecord = config.NewRecord;
    this.placeholder = config.placeholder || "";
    this.CheckRecord = config.CheckRecord;  //复选框事件
    this.DataCallBack = config.DataCallBack;  //回调
    this.key_id = config.key_id; //主键
    this.show_sn = config.show_sn; //显示序列号
    this.show_search_bar = config.show_search_bar;
    this.columns = config.columns;
    this.sorts = {len:0, list: []};
    this.params = {}; //传输的参数

    //初始化表格
    this.table.innerHTML +=this.RenderTable();
    var _this = this;
    if(_this.RowSelect){
        _this.table.addEventListener("click",'>tbody>tr', function(e){
            _this.RowSelect(this);
        });
    }
    if(this.DbRecored){
        this.table.addEventListener("dbclick",'>tbody>tr', function(e){
            _this.DbRecored(this);
        })
    }
    if(this.CheckRecord){
        this.table.querySelector("input[name='check_all']").addeventlistener("change", function(e){
            var obj_id = [];
            if(this.checked){
                _this.table.querySelectorAll("input[name='check']").foreach(function(obj){
                    obj_id.push(this.getAttribute("key_id"));
                    this.setAttribute("checked","true");
                })
            }else{
                _this.table.querySelectorAll("input[name='check']").foreach(function(obj){
                    obj_id.push(this.getAttribute("key_id"));
                    this.removeAttribute("checked");
                })
            }
            this.CheckRecord(obj_id);
        },false);
    }
    if(this.show_sn){
        this.c_size = this.columns.length +1;
    }else{
        this.c_size = this.columns.length;
    }

    CommonData.pagers[table_id] = this;
}
Pager.prototype = {
    Search: function(data){
        "use strict";
        data["page_size"] = this.pager_size;
        data["page_index"] = this.page_index;
        this.params = data;
        this.LoadData();

    },
    LoadData: function(is_first){
        "use strict";
        var _this = this;
        var success = function(result){
            if(result){
                var data = result.data;
                var d_len = data ? data.length : 0;
                if(is_first){
                    if(_this.show_page){
                        if(_this.page_sizes != -1){
                            _this.total_count = result.total_count ? result.total_count : 0;
                        }else{
                            _this.total_count = d_len;
                        }
                        _this.page_count = _this.page_size !=-1 ? Math.ceil(_this.total_count / _this.page_size) : 1;
                    }
                    _this.Init();
                }else if(_this.page_size == -1){
                    _this.total_count = d_len;
                    _this.page_count = _this.page_size !=-1 ? Math.ceil(_this.total_count / _this.page_size) : 1;
                    _this.ResetNum();
                }
                _this.SetBody(data);
                if(_this.call_back){
                    _this.call_back(data);
                }

            }
        }
        var obj = {method: this.ajax_method, url: this.ajax_url,call_back: success,data: _this.params};
        var request = new request(obj);
        request.send();
    },
    SetBody: function(data){
        "use strict";
         var html = [];
         if(!data &&  data.length ==0){
            html.push("<tr><td colspan='"+this.columns.length+"'>无数据</td></tr>");
         }else{
             for(var i = 0 ; i < data.length; i++){
                 var cur_row = data[i];
                 html.push("<tr>");
                 if(this.show_sn){
                     html.push("<td><input type='checkbox' name='check' value='"+cur_row.id+"'></td>");
                 }
                 for(var j = 0; j < this.columns.length; i++){
                     var key = this.columns[j];
                     html.push("<td>"+cur_row[key]+"</td>")

                 }
                 html.push("</tr>");
             }
         }

         this.table.querySelectorAll("tbody")[0].innerHTML +=html.join('');
    },
    Clear: function(){
        "use strict";
        this.table.querySelectorAll("tbody")[0].innerHTML += "<tr><td colspan='"+this.c_size+"' align='center'>无数据</td></tr>";
        if(this.page_size > 0){
            this.AddNumList();
        }
    },
    Init: function(){
        "use strict";
        var tfoot = this.table.querySelectorAll("tfoot")[0];
        if(!this.show_page){
            tfoot.hide();
            return;
        }
        tfoot.show();
        this.AddNumList();
    },
    AddNumList: function(){
        "use strict";
        var _this = this;
        var html = ["<tr>"];
        html.push("<td colspan='"+this.c_size+"'>");
        html.push("<ul class='list-inline list-unstyled'>");
        html.push("<li>");
        html.push("<nav aria-label=\"Page navigation\">");
        html.push("<ul class='pagination'>");
        html.push("   <li>");
        html.push("      <a href='#' aria-label=\"Previous\">");
        html.push("         <span aria-hidden='true'>&laquo;</span>");
        html.push("      </a>");
        html.push("   </li>");
        if(_this.page_count > 0){
            for(var i = 0; i < _this.page_count; i++){
                html.push("<li><a href='javascript:void(0)'><span>"+i+"</span></a></li>");
            }
        }else{
            html.push("<li><a href='javascript:void(0)'><span>1</span></a></li>");
        }

        html.push("   <li>");
        html.push("      <a href='#' aria-label='Next'>");
        html.push("        <span aria-hidden='true'>&raquo;</span>");
        html.push("      </a>");
        html.push("   </li>");
        html.push("</ul></nav>");
        html.push("</li>");
        html.push("<li>");
        html.push("<span>每页:</span>");
        html.push("</li>");
        html.push("<li>");
        html.push("<select id='select_size' class='form-control'>");
        html.push("<option value='5' "+( _this.page_size == 5 ? 'selected' : '')+">5</option>");
        html.push("<option value='5'"+(_this.page_size == 10 ? 'selected' : '')+">10</option>");
        html.push("<option value='5'"+(_this.page_size == 15 ? 'selected' : '')+">15</option>");
        html.push("<option value='5'"+(_this.page_size == 20 ? 'selected' : '')+">20</option>");
        html.push("<option value='-1'"+(_this.page_size == -1 ? 'selected' : '')+">All</option>");
        html.push("</select>");
        html.push("</li>");
        html.push("<li><span>共"+(_this.page_count+1)+"页</span></li>");
        html.push("</ul>");
        html.push("</td>");
        html.push("</tr>");
        this.table.querySelectorAll("tfoot")[0].style.display="table-footer-group";
        this.table.querySelectorAll("tfoot")[0].innerHTML += html.join('');

        var a_class = this.table.querySelectorAll("ul.pagination>li>a");
        for(var i =0; i < a_class.length; i++){
            a_class[i].addEventListener("click",function(e){
                var cur_a = $(this);
                if(cur_a.parentNode().hasAttribute("disabled")){
                    return;
                }
                if(cur_a.parentNode().hasAttribute("active")){

                }
            },false);
        }

    },
    ResetNum: function(){
        "use strict";

    },
    Sort: function(th){
        "use strict";

    },
    RenderTable: function(){
        "use strict";
        var html = [];
        var len = 0;
        if(this.show_search_bar){
            html.push("<div class=\"input-group\">");
            html.push("<input type=\"text\" class=\"form-control\" placeholder=\""+ this.placeholder+"\" aria-describedby=\"basic-addon2\">");
            html.push(" <span class=\"input-group-addon\" id=\"basic-addon2\"><i class='glyphicon glyphicon-search'></i></span>");
            html.push("</div>");
        }
        html.push("<thead><tr>");
        if(this.CheckRecord){
            html.push("<th style='width:30px;text-align: center;'><input type='checkbox' name='check_all'/></th>");
        }
        if(this.show_sn){
            html.push("<th style='width: 30px;text-align: center'><input type='checkbox' name='check'/></th>");
        }
        for(var i = 0; i < this.columns.length; i++){
            var row = this.columns[i];
            if(row.sort){
                var col_name = row.col_name || row.name;
                col_name = col_name.replace(/_ss$/, "");
                html.push("<th col_name='"+ col_name +"' class='"+(row.css ? "pointer" + row.css +"'":"pointer'")+ (row.style ? " style=\"" + row.style+"\"":"")+">" + row.text);
                if(row.sort === true){
                    this.sorts.list.push({name: col_name, sort: null, sn: -1});
                    html.push("<span class='glyphicon glyphicon-triangle-top' style='padding_top:3px;'></span>")
                }else{
                    this.sorts.len++;
                    this.sorts.list.push({name:col_name, sort:row.sort,sn:this.sorts.len});
                    html.push("<span class=\"glyphicon glyphicon-triangle-"+(row.sort == "asc" ? "top":"down")+ "pull-right\" style='padding-top:2px;' title='"+i+"'></span>")
                }
            }else{
                html.push("<th" + (row.css ? " class='" + row.css + "'" : "") + (row.style ? " style=\"" + row.style + "\"" : "") + " >" + row.text);
            }
            html.push("</th>")
        }
        html.push("</tr></thead>");
        html.push("<tbody></tbody>");
        html.push("<tfoot></tfoot>");
        return (html.join(""));
    }

}

