window.onload = function()
{
    function ElimeSolution(elem, callback)
    {
        callback(elem);
        var list = elem.children;
        for (var i = 0; i < list.length; i++)
        {
            ElimeSolution(list[i], callback)
        }
    }

    ElimeSolution(document.getElementById('login_form'), function (elem) 
    {
        console.log(elem);
    });
};