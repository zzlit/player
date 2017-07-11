       function upInfo() {
            if(document.getElementById('show').style.display != "block"){
                document.getElementById('show').style.display = "block";
            } else {
                document.getElementById('show').style.display = "none";
            }
            var lStorage = window.localStorage;
            var show = window.document.getElementById('show');
            if (window.localStorage.myBoard) {
                show.value = "                                                  历史记录" + "\n" + window.localStorage.myBoard;
            }
            else {
                show.value = "                                                  还没有历史记录";
            }
        }