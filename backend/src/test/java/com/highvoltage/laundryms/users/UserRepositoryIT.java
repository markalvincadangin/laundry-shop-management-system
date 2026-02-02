package com.highvoltage.laundryms.users;

import com.highvoltage.laundryms.support.AbstractPostgresIT;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
class UserRepositoryIT extends AbstractPostgresIT {

    @Autowired UserRepository userRepository;

    @Test
    void saves_and_finds_by_username() {
        User u = new User(null, "Mark", "Alvin", "staff1", "hash", "STAFF");
        userRepository.save(u);

        assertThat(userRepository.findByUsername("staff1")).isPresent();
    }

    @Test
    void username_must_be_unique() {
        userRepository.save(new User(null, "A", "B", "dup", "hash1", "STAFF"));

        assertThatThrownBy(() ->
                userRepository.saveAndFlush(new User(null, "C", "D", "dup", "hash2", "STAFF"))
        ).isInstanceOf(Exception.class); // keep generic; provider exception differs
    }
}
