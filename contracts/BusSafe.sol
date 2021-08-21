pragma solidity >=0.4.22 <0.9.0;

contract BusSafe {
    uint32 check_count;

    struct check_list {
        address checker;
        string car_id;
        string check_res;
        string check_etc;
        uint64 check_time;
    }

    event AddCheck(
        address checker, 
        string car_id, 
        string check_res, 
        string check_etc, 
        uint64 check_time
    );

    check_list[] public checks;

    function AddCheckList(string memory _car_id, string memory _check_list, string memory _check_etc, uint64 _check_time) public {
        address _checker = msg.sender;
        checks.push(check_list(_checker, _car_id, _check_list, _check_etc, _check_time));
        check_count ++;
        emit AddCheck(_checker, _car_id, _check_list, _check_etc, _check_time);
    }

    function TotalCount() public view returns(uint32) {
        return check_count;
    }

    function GetCheck(uint _check_count) public view returns(address, string memory, string memory, string memory, uint64){
        return(checks[_check_count].checker, checks[_check_count].car_id, checks[_check_count].check_res, checks[_check_count].check_etc, checks[_check_count].check_time);
    }

    // function AllGetCheck() public view returns(check_list[] memory) {
    //     return checks;
    // }
}