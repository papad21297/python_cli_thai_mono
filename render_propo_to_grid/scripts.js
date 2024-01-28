function onload_fn() {
  const divjsout = document.getElementById('javascript_output');
  divjsout.innerHTML = '';

  linkreq(
    'http://localhost:3000/source_text_file/ref.txt',
  ).then(
    function (response) {
      var appended_response = response;
      if (response[response.length - 1] != '\n') {
        appended_response += ' ';
      }
      use_result(appended_response.split('\n'))
    }
  ).catch(
    function(error) {
      console.error(error);
    }
  )

}

function use_result(text_arr) {
  for (let i = 0; i < text_arr.length; i++) {
    if (i >= 0) {
      var txt_cll_arr = run_char(text_arr[i]);
      txt_cll_arr = txt_cll_arr.slice(
        0, txt_cll_arr.length - 1
      )
      const arr_size = txt_cll_arr.length;
      const row_length = 50;
      const subrow_amount = Math.ceil(
        txt_cll_arr.length
        / row_length
      );

      for (let j = 0; j < subrow_amount; j++) {
        const new_txt_cll_arr = txt_cll_arr.slice(
          (row_length * j),
          Math.min(
            row_length * (j + 1),
            arr_size
          )
        )

        append_line(i + '/' + j, new_txt_cll_arr);

      }

    }
  }
}

function loop_line(line_arr) {
  for (let i = 0; i < line_arr.length; i++) {
    if (i == 0) {
      append_line(line_arr[i]);
    }
  }
}

function run_char(line_component) {
  var group_stat = 0;
  var txt_cll_arr = [];
  for (let i = 0; i < line_component.length; i++) {
    if (i >= 0) {
      const res_arr_obj = apply_char_separate_rule(
        line_component.length - i,
        i
      );
      const group_arr = loop_res_obj(res_arr_obj, gen_lbl_arr(
        line_component,
        i,
        max_keys_size(res_arr_obj)
      ));
      if (group_arr.length == 0) {
        group_arr.push(
          put_char_label(line_component.charCodeAt(i))
        );
      }
      if (i >= group_stat) {
        txt_cll_arr.push(group_arr.join('-'));

        group_stat += group_arr.length;
      }
    }
  }
  return txt_cll_arr;
}

function gen_lbl_arr(line_component, idx, step_fw) {
  const res_arr = [];
  for (let i = 0; i < step_fw; i++) {
    if (idx <= line_component.length) {
      res_arr.push(put_char_label(
        line_component.charCodeAt(idx + i)
      ));
    }
  }
  return res_arr;
}

function max_keys_size(res_obj) {
  var max_size = 0;
  for (let i = 0; i < res_obj.length; i++) {
    if (Object.keys(res_obj[i]).length >= max_size) {
      max_size = Object.keys(res_obj[i]).length;
    }
  }
  return max_size;
}

function loop_res_obj(res_obj, res_arr) {
  var group_arr = [];
  for (let i = 0; i < res_obj.length; i++) {
    var smmr_bool = 1;
    const lbl_arr = [];
    const item_keys = Object.keys(res_obj[i]);
    for (let j = 0; j < item_keys.length; j++) {
      if (!chk_lbl_rng(
        res_arr[j],
        res_obj[i][item_keys[j]]
      )) {
        smmr_bool = 0;
      }
      lbl_arr.push(res_arr[j]);

    }
    if (smmr_bool != 0) {
      group_arr = lbl_arr.slice(0, (lbl_arr.length - 1));
    }
  }
  return group_arr;
}

function chk_lbl_rng(lbl, rng_obj) {
  var chk_res = 0;

  const rng_arr = rng_obj["rng"].split(',');
  for (let i = 0; i < rng_arr.length; i++) {
    if (rng_arr[i].split('-').length == 2) {
      if (
        (lbl.split('_')[0] == 'th')
        && (
          parseInt(lbl.split('_')[1]) >= (parseInt(rng_arr[i].split('-')[0]))
          && parseInt(lbl.split('_')[1]) <= (parseInt(rng_arr[i].split('-')[1]))
        )
      ) {
        chk_res = 1;
      }
    } else if (rng_arr[i].split('-').length == 1) {
      if (
        (lbl.split('_')[0] == 'th')
        && (
          parseInt(lbl.split('_')[1])
          == (parseInt(rng_arr[i]))
        )
      ) {
        chk_res = 1;
      }
    }
  }

  return ['notin', 'in'].indexOf(rng_obj["cond"]) == chk_res
}

function apply_char_separate_rule(right_margin, left_margin) {
  const res_arr_obj = [];
  const rule_arr = [
    'in(0-45),in(48,50-57,70-76),notin(48,50-57,70-76)',
    'in(0-45),in(48,51-56),in(71-74),notin(48,50-57,70-76)',
    'in(0-45),in(71-74),in(50),notin(48,50-57,70-76)',
    'in(0-45),in(51,55),in(75),notin(48,50-57,70-76)',
    'in(0-45),in(55),in(76),notin(48,50-57,70-76)',
    'in(35,37),in(68),notin(68)'
  ];

  for (let i = 0; i < rule_arr.length; i++) {
    if ((right_margin + 1) >= break_arr_item(rule_arr[i] + ',').length) {
      const res_obj = {};
      const arr_item = rule_arr[i];
      const new_item = break_arr_item(arr_item + ',');
      for (let j = 0; j < new_item.length; j++) {
        if (
          (left_margin + j)
          <= ((left_margin + right_margin) - 1)
        ) {
          res_obj[j] = {
            "cond": filter_by_depth(
              new_item[j],
              0
            ),
            "rng": filter_by_depth(
              new_item[j],
              1
            )
          }
        }
      }
      res_arr_obj.push(res_obj);
    }
  }
  return res_arr_obj;
}

function break_arr_item(arr_item) {
  const new_item = [];
  var parendep = 0;
  var prevval = 0;
  for (let i = 0; i < arr_item.length; i++) {
    if (arr_item[i] == '(') {
      parendep += 1;
    } else if (arr_item[i] == ')') {
      parendep -= 1;
    }
    if (
      (arr_item[i] == ',')
      && (parendep == 0)
    ) {
      new_item.push(
          arr_item.substring(prevval, i),
      )
      prevval = i;
    }
  }
  return new_item;
}

function filter_by_depth(char_list, _parendep) {
  var paren_layer_item = '';
  var parendep = 0;
  for (let i = 0; i < char_list.length; i++) {
    if (parendep == _parendep) {
      paren_layer_item += char_list[i]
    }
    if (char_list[i] == '(') {
      parendep += 1;
    } else if (char_list[i] == ')') {
      parendep -= 1;
    }
  }
  if (paren_layer_item[0] == ',') {
    paren_layer_item = paren_layer_item.substring(1,
      paren_layer_item.length)
  }
  if (
    (paren_layer_item[
      (paren_layer_item.length - 1)
    ] == '(')
    || (paren_layer_item[
      (paren_layer_item.length - 1)
    ] == ')')
  ) {
    paren_layer_item = paren_layer_item.substring(
      0, (paren_layer_item.length - 1)
    )
  }
  return paren_layer_item
}

function render_each_char(char_num) {
  var rendered_char = '';
  const rule_arr = [
    '3629/3633,3635-3642,3655-3661',
    '3620/3653',
    '88/3643-3646',
    '63/3662-3663,3674-3675'
  ];
  for (let i = 0; i < rule_arr.length; i++) {
    const condition_detail = rule_arr[i].split('/')[1];
    if (separate_condition(
      condition_detail.split(','),
      char_num
    ) == 1) {
      rendered_char += String.fromCharCode(parseInt(rule_arr[i].split('/')[0]));
    }
  }
  rendered_char += String.fromCharCode(char_num);
  return rendered_char;
}

function separate_condition(condition_detail, char_num) {
  var aligning_char = 0;
  for (let i = 0; i < condition_detail.length; i++) {
    const range_arr = condition_detail[i].split('-');
    if (range_arr.length == 2) {
      if (
        (char_num >= range_arr[0])
        && (char_num <= range_arr[1])
      ) {
        aligning_char = 1;
      }
    } else {
      if (char_num == range_arr[0]) {
        aligning_char = 1;
      }
    }
  }
  return aligning_char;
}

function put_char_label(char_num) {
  var char_label = '';
  if (
    (char_num >= 3585)
    && (char_num <= 3676)
  ) {
    char_label += 'th_' + (char_num - 3585);
  } else {
    char_label += char_num;
  }
  return char_label
}

function append_line(text, arr) {
  if (arguments.length == 1) {
    const divtext = document.createElement('div');
    const text_node = document.createTextNode(text);
    divtext.setAttribute('id', 'text');
    divtext.appendChild(text_node);

    const divrow = document.createElement('div');
    divrow.setAttribute('id', 'row');
    divrow.appendChild(divtext);

    const divjsout = document.getElementById('javascript_output');
    divjsout.appendChild(divrow)
  } else if (arguments.length == 2) {
    const divblockrow = document.createElement('div');
    divblockrow.setAttribute('id', 'row');

    const divcellnumtext = document.createElement('div');

    if (text.split('/')[1] == '0') {
      divcellnumtext.setAttribute('id', 'numcelltext');
      const divnumtext = document.createTextNode(parseInt(text.split('/')[0]) + 1)
      divcellnumtext.appendChild(divnumtext);
    } else {
      divcellnumtext.setAttribute('id', 'contnumcelltext');
      const divnumtext = document.createTextNode('>')
      divcellnumtext.appendChild(divnumtext);
    }

    divblockrow.appendChild(divcellnumtext);

    for (let i = 0; i < arr.length; i++) {
      const divcelltext = document.createElement('div');
      if (arr[i].includes('th_50')) {
        divcelltext.setAttribute('id', 'widecelltext');
      } else {
        divcelltext.setAttribute('id', 'celltext');
      }
      if (construct_cll(arr[i]) == ' ') {
        const cell_space_node = document.createTextNode('•');

        const divdot = document.createElement('div');
        divdot.setAttribute('id', 'blanksign');
        divdot.appendChild(cell_space_node);

        divcelltext.appendChild(divdot);
      } else if (construct_cll(arr[i]) == '\t') {
        const cell_space_node = document.createTextNode('>');

        const divdot = document.createElement('div');
        divdot.setAttribute('id', 'blanksign');
        divdot.appendChild(cell_space_node);

        divcelltext.appendChild(divdot);
      } else {
        const cell_text_node = document.createTextNode(
          construct_cll(arr[i])
        );
        divcelltext.appendChild(cell_text_node);
      }
      divblockrow.appendChild(divcelltext);
    }

    const divgridjsout = document.getElementById('javascript_output');
    divgridjsout.appendChild(divblockrow);
  }
}

function construct_cll(src) {
  var res = '';

  const arr = src.split('-');
  for (let i = 0; i < arr.length; i++) {
    const item_arr = arr[i].split('_');
    if (item_arr.length == 1) {
      if (parseInt(item_arr) == 13) {
        res = '<';
      } else {
        res = String.fromCharCode(parseInt(item_arr));
      }
    } else if (item_arr.length == 2) {
      if (item_arr[0] == 'th') {
        res += String.fromCharCode(parseInt(item_arr[1]) + 3585);
      }
    }
  }

  return res;
}

async function linkreq(url) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  return new Promise(function(resolve, reject) {
    xhr.onload = function() {
      if (xhr.status == 200) {
        resolve(xhr.responseText);
      } else {
        reject(xhr.statusText);
      }
    };
    xhr.onerror = function() {
      reject(xhr.statusText);
    };
    xhr.send();
  });
}